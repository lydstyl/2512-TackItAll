# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TrackItAll is a personal tracking application built with Next.js that allows users to track various aspects of their life (expenses, workouts, sleep, mood, etc.) with customizable trackers and statistics.

**Tech Stack**: Next.js 16 (App Router), TypeScript, TailwindCSS, shadcn/ui, Prisma + SQLite, NextAuth.js v5, Vitest, Chart.js

## Development Commands

### Running the Application

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm start            # Run production build
npm run lint         # Run ESLint
```

### Testing (TDD Workflow)

```bash
npm test                        # Run all tests in watch mode
npm test -- <filename>          # Run specific test file (e.g., Email.test.ts)
npm run test:ui                 # Open Vitest UI
npm run test:coverage           # Generate coverage report
```

### Database (Prisma)

```bash
npx prisma generate             # Generate Prisma Client after schema changes
npx prisma migrate dev          # Create and apply migrations
npx prisma studio               # Open Prisma Studio GUI
npx prisma db push              # Push schema changes without migration (dev only)
```

## Architecture: Clean Architecture

This project follows **Clean Architecture** with strict layer separation:

```
src/
  domain/              # Pure business logic, no external dependencies
    entities/          # Business entities (User, Tracker, Entry)
    valueObjects/      # Immutable value objects with validation
    repositories/      # Repository interfaces (implemented in infrastructure)
    rules/             # Domain rules and validation logic

  application/         # Use cases (business logic orchestration)
    usecases/          # Use case implementations (CreateTracker, AddEntry, etc.)
    dto/               # Data Transfer Objects
    ports/             # Interfaces for external dependencies

  infrastructure/      # External dependencies and implementations
    prisma/            # Prisma client, repositories, mappers
    auth/              # NextAuth configuration, password hashing
    config/            # Environment and configuration

app/                   # Next.js App Router (UI layer, moved from src/ui/app/)
components/            # React components (moved from src/ui/components/)
lib/                   # UI utilities (moved from src/ui/lib/)
tests/                 # All test files
```

**Dependency Rules** (Critical):

- **Domain**: Zero dependencies on other layers (pure TypeScript)
- **Application**: Depends only on `domain/`
- **Infrastructure**: Implements `domain/` interfaces
- **UI (app/, components/)**: Uses `application/` use cases

## Critical Domain Patterns

### Polymorphic Entry Values

The system supports 5 tracker types, each with different value storage:

**TrackerType Enum**:

- `BOOLEAN`: true/false → displayed as "Yes"/"No"
- `NUMBER`: decimal numbers
- `TEXT`: free text
- `DURATION`: HH:MM format → **stored as minutes** (e.g., "02:30" = 150 minutes)
- `CURRENCY`: EUR only → **stored as cents** (e.g., €15.50 = 1550 cents)

**EntryValue Classes** (`src/domain/valueObjects/EntryValue.ts`):

```typescript
// Abstract base class
abstract class EntryValue {
  abstract getType(): TrackerType;
  abstract getRawValue(): any;       // For storage
  abstract getDisplayValue(): string; // For UI
}

// Implementations
BooleanValue(true) → getRawValue()=true, getDisplayValue()="Yes"
DurationValue(150) → getRawValue()=150, getDisplayValue()="02:30"
DurationValue.fromHHMM("02:30") → getRawValue()=150
CurrencyValue(1550) → getRawValue()=1550, getDisplayValue()="€15.50"
CurrencyValue.fromEuros(15.50) → getRawValue()=1550
```

### Prisma Schema: Polymorphic Storage Strategy

The `Entry` model uses **single table with multiple value columns** (not JSON):

```prisma
model Entry {
  // Only ONE of these will be non-null based on TrackerType:
  boolValue   Boolean?  // BOOLEAN
  numValue    Float?    // NUMBER
  textValue   String?   // TEXT
  intValue    Int?      // DURATION (minutes) AND CURRENCY (cents)
}
```

**Why this approach?**:

- Enables SQL aggregations (AVG, SUM, MIN, MAX) for statistics
- Type-safe with Prisma
- Indexed queries for performance
- Alternative JSON storage was rejected (no SQL aggregations)

### EntryMapper (Critical Infrastructure Component)

`src/infrastructure/prisma/mappers/EntryMapper.ts` converts between database and domain:

```typescript
// DB → Domain: Maps columns to EntryValue based on tracker.type
toDomain(prismaEntry, tracker): Entry {
  // Reads tracker.type to determine which column to use
  // Creates appropriate EntryValue subclass
}

// Domain → DB: Maps EntryValue to appropriate column
toPrisma(entry): PrismaEntryData {
  // Sets only the relevant column based on entry.value.getType()
}
```

## Testing Strategy

**TDD Workflow** (strictly followed):

1. Write test first (Red)
2. Implement minimum code (Green)
3. Refactor if needed (Clean)

**Test Structure**:

- `tests/unit/domain/` - Value objects, entities (42 tests currently passing)
- `tests/unit/application/` - Use cases with mock repositories
- `tests/integration/` - API routes with real Prisma
- `tests/helpers/` - Test utilities

**Important**: Tests use relative imports due to Vitest alias resolution:

```typescript
// In tests, use relative paths:
import { Email } from '../../../../src/domain/valueObjects/Email'
// NOT: import { Email } from '@/domain/valueObjects/Email';
```

## Path Aliases

```typescript
@/domain/*         → ./src/domain/*
@/application/*    → ./src/application/*
@/infrastructure/* → ./src/infrastructure/*
@/shared/*         → ./src/shared/*
@/components/*     → ./components/*
@/lib/*            → ./lib/*
```

## Authentication & Security

- **NextAuth.js v5** with Credentials provider (not OAuth in v1)
- Passwords hashed with bcrypt
- All routes protected via `middleware.ts` (redirects to /login)
- Row-level security: `WHERE userId = session.user.id` in all queries
- Cascade deletes: User deletion removes all trackers and entries

## Key Implementation Notes

### When Adding New Tracker Types

1. Add to `TrackerType` enum
2. Create new `EntryValue` subclass with tests
3. Update `EntryMapper.toDomain()` and `.toPrisma()`
4. Add new column to `Entry` model if needed
5. Update `EntryValueInput.tsx` component for UI

### Statistics Calculation

**Current approach (v1)**: On-the-fly calculation (no caching)

- Simple, always up-to-date
- Acceptable for <1000 entries/tracker
- Use SQL aggregations directly on `intValue`, `numValue` columns

**Future optimization** (if needed): Pre-computed stats table

### Use Case Pattern

```typescript
// application/usecases/tracker/CreateTracker.ts
export class CreateTracker {
  constructor(private trackerRepo: ITrackerRepository) {}

  async execute(dto: CreateTrackerDTO): Promise<CreateTrackerResult> {
    // 1. Validate with domain value objects
    const name = new TrackerName(dto.name)

    // 2. Create domain entity
    const tracker = new Tracker(/* ... */)

    // 3. Use repository (interface from domain)
    await this.trackerRepo.save(tracker)

    return { success: true, tracker }
  }
}
```

### API Route Pattern

```typescript
// app/api/trackers/route.ts
export async function POST(request: Request) {
  // 1. Check authentication
  const session = await auth()
  if (!session) return unauthorized()

  // 2. Parse and validate input
  const body = await request.json()

  // 3. Instantiate use case with repository
  const useCase = new CreateTracker(new PrismaTrackerRepository())

  // 4. Execute and return
  const result = await useCase.execute({
    userId: session.user.id,
    ...body
  })

  return NextResponse.json(result.tracker, { status: 201 })
}
```

## Common Pitfalls

1. **Don't mix layers**: Domain code should never import from `infrastructure/` or `application/`
2. **Duration/Currency storage**: Always store as minutes/cents, convert at boundaries
3. **EntryValue type matching**: Validate that entry type matches tracker type in use cases
4. **Prisma Client**: Import from `@/infrastructure/prisma/client`, not `@prisma/client` directly
5. **Test imports**: Use relative paths in test files, not aliases

## Code Must Be in English

All code, comments, variable names, and documentation must be in English, even though planning documents may be in French.
