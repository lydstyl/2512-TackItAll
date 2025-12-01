# TackItAll - Personal Tracking Application - Implementation Plan

## Overview

Application Next.js de tracking personnel permettant de créer des trackers personnalisés (dépenses, sport, sommeil, etc.) et d'afficher des statistiques personnalisées.

**État actuel**: Projet vide (uniquement first_prompt.md)
**Objectif**: Application complète v1 avec auth multi-utilisateurs, CRUD trackers/entries, et statistiques

## Stack Technique

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Database**: Prisma + SQLite
- **Testing**: Vitest (TDD)
- **Auth**: NextAuth.js v5 (Credentials provider)
- **Charts**: Chart.js (react-chartjs-2)

## Architecture: Clean Architecture

```
src/
  domain/          # Entités, Value Objects, Interfaces repositories
  application/     # Use Cases (business logic)
  infrastructure/  # Prisma, Auth, Implementations
  ui/             # Next.js App Router, Components, API routes
tests/            # Unit, Integration tests
```

**Règles de dépendance**:
- Domain: Aucune dépendance externe (pure business logic)
- Application: Dépend uniquement de domain
- Infrastructure: Implémente les interfaces domain
- UI: Utilise application (use cases)

## Domain Model

### Entités Principales

**User**
- `id: UserId`
- `email: Email`
- `name: string`
- `createdAt: Date`

**Tracker**
- `id: TrackerId`
- `userId: UserId`
- `name: TrackerName`
- `type: TrackerType` (BOOLEAN | NUMBER | TEXT | DURATION | CURRENCY)
- `description: string | null`
- `createdAt, updatedAt: Date`

**Entry**
- `id: EntryId`
- `trackerId: TrackerId`
- `value: EntryValue` (polymorphic)
- `recordedAt: Date` (when event occurred)
- `note: string | null`

### Value Objects

**EntryValue** (polymorphic):
- `BooleanValue`: true/false
- `NumberValue`: decimal number
- `TextValue`: string
- `DurationValue`: stored as minutes (INT), displayed as HH:MM
- `CurrencyValue`: stored as cents (INT), displayed as €XX.XX

## Prisma Schema

### Décision: Single Table avec colonnes multiples

```prisma
model Entry {
  id          String   @id @default(cuid())
  trackerId   String

  // Polymorphic storage
  boolValue   Boolean?  // BOOLEAN type
  numValue    Float?    // NUMBER type
  textValue   String?   // TEXT type
  intValue    Int?      // DURATION (minutes) & CURRENCY (cents)

  note        String?
  recordedAt  DateTime
  createdAt   DateTime @default(now())

  tracker     Tracker  @relation(fields: [trackerId], references: [id], onDelete: Cascade)

  @@index([trackerId])
  @@index([trackerId, recordedAt])
}
```

**Rationale**:
- Simple queries, efficient SQL aggregations (AVG, SUM, MIN, MAX)
- Type-safe avec Prisma
- Overhead acceptable (~3 NULL columns par row)
- Alternative JSON rejetée: pas d'indexation ni aggregation possible

### Stockage des Types Spéciaux

**Duration (HH:MM)**:
- Storage: `intValue` en minutes (ex: "02:30" → 150)
- Conversion: `DurationValue.fromHHMM("02:30")` → 150 minutes
- Display: `durationValue.getDisplayValue()` → "02:30"
- Stats: SQL AVG/SUM direct sur intValue

**Currency (EUR)**:
- Storage: `intValue` en centimes (ex: €15.50 → 1550)
- Conversion: `CurrencyValue.fromEuros(15.50)` → 1550 cents
- Display: `currencyValue.getDisplayValue()` → "€15.50"
- Stats: SUM(intValue) / 100.0 pour total en euros

## Use Cases (TDD)

### Tracker Use Cases
- `CreateTracker`: Créer un tracker (5 types supportés)
- `UpdateTracker`: Modifier nom/description
- `DeleteTracker`: Supprimer tracker + cascade entries
- `ListTrackers`: Lister tous les trackers de l'utilisateur
- `GetTrackerHistory`: Historique des entries

### Entry Use Cases
- `AddEntry`: Ajouter une entry (valide type vs tracker)
- `UpdateEntry`: Modifier une entry existante
- `DeleteEntry`: Supprimer une entry

### Statistics Use Cases
- `GetTrackerStats`: Stats complètes selon période
  - `GetBooleanStats`: Pourcentage true/false
  - `GetNumericStats`: Total, Average, Min, Max
  - `GetTimeTrends`: Évolution par jour/semaine/mois

**Décision Stats v1**: Calcul on-the-fly (pas de cache)
- Simple, toujours à jour
- Performance acceptable <1000 entries/tracker
- Migration vers cache si besoin >10k entries

### Auth Use Cases
- `RegisterUser`: Inscription (bcrypt hash password)
- `AuthenticateUser`: Login (verify password)

## Infrastructure

### Repositories (Prisma)
- `PrismaUserRepository`: implements IUserRepository
- `PrismaTrackerRepository`: implements ITrackerRepository
- `PrismaEntryRepository`: implements IEntryRepository

### Mappers (Critical)
**EntryMapper**: Convertit DB ↔ Domain
```typescript
// DB → Domain: Map colonnes → EntryValue selon tracker.type
toDomain(prismaEntry, tracker): Entry

// Domain → DB: Map EntryValue → colonnes appropriées
toPrisma(entry): PrismaEntryData
```

### Authentication
**NextAuth.js v5** avec Credentials provider:
- `next-auth.config.ts`: Configuration auth
- `BcryptPasswordHasher`: Hashing passwords
- `middleware.ts`: Protection routes (redirect non-auth vers /login)

**Rationale NextAuth vs alternatives**:
- Control total sur user data
- No vendor lock-in (vs Clerk)
- Free & open-source
- Extensible (OAuth Google/GitHub later)

## UI Layer

### Pages Structure (App Router)

```
app/
  (auth)/
    login/page.tsx
    register/page.tsx
  (dashboard)/
    layout.tsx              # Protected layout
    trackers/
      page.tsx              # List all trackers
      new/page.tsx          # Create tracker
      [id]/
        page.tsx            # Tracker detail + quick entry
        edit/page.tsx       # Edit tracker
        history/page.tsx    # Entry history
        stats/page.tsx      # Statistics
  api/
    auth/[...nextauth]/route.ts
    trackers/route.ts       # GET (list), POST (create)
    trackers/[id]/route.ts  # GET, PUT, DELETE
    trackers/[id]/entries/route.ts
    trackers/[id]/stats/route.ts
    entries/[id]/route.ts   # PUT, DELETE
```

### Components (shadcn/ui)

**Common** (shadcn/ui):
- Button, Input, Card, Textarea, Checkbox, Select
- Dialog (confirmations)
- Toast (notifications)

**Trackers**:
- `TrackerList`: Grid/list de TrackerCard
- `TrackerCard`: Display tracker avec quick stats
- `TrackerForm`: Create/Edit avec TrackerTypeSelector
- `TrackerTypeSelector`: Radio group des 5 types

**Entries**:
- `EntryForm`: Add/Edit entry
- `EntryValueInput`: **Component critique** - input dynamique selon type:
  - BOOLEAN → Checkbox
  - NUMBER → Input type="number" step="0.01"
  - TEXT → Textarea
  - DURATION → Input type="time" (HH:MM)
  - CURRENCY → Input type="number" step="0.01" prefix="€"
- `EntryList`: Table avec entries + actions

**Stats**:
- `StatsCard`: Wrapper pour stats display
- `BooleanStatsDisplay`: "True: 21 (70%), False: 9 (30%)"
- `NumericStatsDisplay`: "Total: €450 | Avg: €15 | Min: €5 | Max: €50"
- `TrendChart`: Line chart (Chart.js) avec grouping day/week/month

### API Routes

Toutes les routes protégées via middleware:
```typescript
const session = await auth()
if (!session) return unauthorized()
```

Chaque route instancie use case avec Prisma repositories:
```typescript
const useCase = new CreateTracker(new PrismaTrackerRepository())
const result = await useCase.execute({ userId: session.user.id, ...body })
```

## Implementation Plan (15 Days)

### Phase 1: Setup (Days 1-2)
- [ ] Init Next.js project avec TypeScript + Tailwind
- [ ] Install dependencies: Prisma, NextAuth, Vitest, shadcn/ui, Chart.js
- [ ] Configure tsconfig avec path aliases (@/domain, @/application, etc.)
- [ ] Create folder structure (src/domain, application, infrastructure, ui)
- [ ] Setup Vitest + test utilities
- [ ] Create Prisma schema + première migration
- [ ] Install shadcn/ui components (Button, Input, Card, Dialog, Toast, Checkbox)

### Phase 2: Domain & Use Cases TDD (Days 3-7)

**Day 3 - Value Objects**:
- [ ] Email.test.ts → Email.ts
- [ ] TrackerName.test.ts → TrackerName.ts
- [ ] EntryValue.test.ts → EntryValue.ts (5 types: Boolean, Number, Text, Duration, Currency)

**Day 4 - Entities**:
- [ ] User.test.ts → User.ts
- [ ] Tracker.test.ts → Tracker.ts
- [ ] Entry.test.ts → Entry.ts

**Day 5 - CreateTracker Use Case**:
- [ ] CreateTracker.test.ts (test 5 tracker types)
- [ ] CreateTracker.ts implementation
- [ ] MockTrackerRepository.ts

**Day 6 - AddEntry Use Case**:
- [ ] AddEntry.test.ts (test 5 entry types)
  - Test: Boolean entry to boolean tracker ✓
  - Test: Duration "02:30" stored as 150 minutes
  - Test: Currency €15.50 stored as 1550 cents
  - Test: Type mismatch throws error
  - Test: Future date throws error
- [ ] AddEntry.ts implementation
- [ ] MockEntryRepository.ts

**Day 7 - Stats Use Cases**:
- [ ] GetTrackerStats.test.ts
- [ ] GetBooleanStats.ts (percentage calculation)
- [ ] GetNumericStats.ts (avg, min, max, total)
- [ ] GetTimeTrends.ts (grouping by day/week/month)
- [ ] Other use cases: UpdateTracker, DeleteTracker, ListTrackers

### Phase 3: Infrastructure (Days 8-9)

**Day 8 - Repositories**:
- [ ] PrismaUserRepository.ts
- [ ] PrismaTrackerRepository.ts
- [ ] PrismaEntryRepository.ts
- [ ] **EntryMapper.ts** (CRITICAL: DB ↔ Domain conversion)

**Day 9 - Auth & API**:
- [ ] BcryptPasswordHasher.ts
- [ ] RegisterUser + AuthenticateUser use cases
- [ ] next-auth.config.ts
- [ ] middleware.ts (route protection)
- [ ] API routes: /api/trackers, /api/trackers/[id], /api/entries, /api/stats
- [ ] Integration tests

### Phase 4: UI (Days 10-13)

**Day 10 - Auth UI**:
- [ ] Login page + LoginForm (shadcn/ui)
- [ ] Register page + RegisterForm

**Day 11 - Trackers UI**:
- [ ] TrackerList + TrackerCard
- [ ] TrackerForm avec TrackerTypeSelector
- [ ] Create tracker page
- [ ] Edit tracker page

**Day 12 - Entries UI**:
- [ ] **EntryValueInput.tsx** (CRITICAL: dynamic input per type)
- [ ] EntryForm
- [ ] EntryList
- [ ] Quick entry sur tracker detail page

**Day 13 - Stats UI**:
- [ ] History page (EntryList avec pagination)
- [ ] Stats page (StatsCard layout)
- [ ] BooleanStatsDisplay + NumericStatsDisplay
- [ ] TrendChart (Chart.js avec react-chartjs-2)

### Phase 5: Polish (Days 14-15)
- [ ] E2E manual testing (tous les 5 types)
- [ ] Loading states
- [ ] Error toasts
- [ ] Empty states avec CTA
- [ ] Confirmation dialogs (delete)
- [ ] Form validation
- [ ] Mobile responsive
- [ ] README documentation

## Critical Files (Top 10)

### Must Create First
1. `/prisma/schema.prisma` - Database schema complet
2. `/src/domain/valueObjects/EntryValue.ts` - Polymorphic value object (5 types)
3. `/src/domain/valueObjects/TrackerType.ts` - Enum des types
4. `/src/infrastructure/prisma/mappers/EntryMapper.ts` - DB ↔ Domain conversion
5. `/src/application/usecases/entry/AddEntry.ts` - Core entry creation logic

### Critical UI Components
6. `/src/ui/components/entries/EntryValueInput.tsx` - Dynamic input per type
7. `/src/ui/components/trackers/TrackerForm.tsx` - Create/edit trackers
8. `/src/ui/components/stats/TrendChart.tsx` - Chart.js integration

### Configuration
9. `/vitest.config.ts` - Test setup
10. `/src/infrastructure/auth/next-auth.config.ts` - Auth configuration

## Key Architectural Decisions

### ✅ Confirmed Decisions
- **Multi-user**: Oui, avec NextAuth.js
- **Duration format**: HH:MM (stored as minutes)
- **Currency format**: EUR (stored as cents)
- **Statistics**: Basiques + Pourcentages + Tendances temporelles
- **Stats calculation**: On-the-fly (v1)
- **Storage strategy**: Single table avec colonnes multiples
- **UI Components**: shadcn/ui
- **Charts**: Chart.js (react-chartjs-2)

### 🔐 Security
- Middleware protect toutes les routes sauf /login, /register
- Row-level filtering: `WHERE userId = session.user.id`
- Password hashing: bcrypt
- ON DELETE CASCADE: User deleted → trackers + entries deleted

### 📊 Data Validation
- Domain layer: Value Objects valident (Email format, TrackerName length)
- Application layer: Use cases valident (type matching, future dates)
- UI layer: Form validation + error display

## Testing Strategy

**Test Pyramid**:
- 80% Unit tests (domain + application) - Fast, isolated, mocks
- 15% Integration tests (API routes + DB) - Real Prisma
- 5% E2E tests (manual) - Critical user flows

**TDD Workflow**:
1. Write test first (Red)
2. Implement minimum code (Green)
3. Refactor (Clean)
4. Repeat

## Success Criteria

### Must-Have v1
✅ Multi-user with authentication
✅ All 5 tracker types working
✅ CRUD trackers + entries
✅ Statistics: basiques, pourcentages, tendances
✅ Duration HH:MM, Currency EUR correct
✅ 100% use case test coverage
✅ Mobile-responsive UI

### Nice-to-Have v2
- Advanced charts (bar, pie)
- Calendar view
- Reminders
- PWA support
- Dark mode
- Export CSV/JSON
- Tags
- Recurring entries

## Next Steps

1. **Start Phase 1** (Setup): Initialize project, install dependencies, create structure
2. **Follow TDD strictly**: Write tests before implementation
3. **Prisma first**: Create schema + migration before domain layer
4. **Domain → Application → Infrastructure → UI**: Respect layer dependencies
5. **Test incrementally**: Run `npm test` after each use case

---

**Note**: All code must be in English, even though prompts are in French.
