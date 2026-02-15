import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { CreateTracker } from '@/application/usecases/tracker/CreateTracker';
import { PrismaTrackerRepository } from '@/infrastructure/prisma/repositories/PrismaTrackerRepository';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repository = new PrismaTrackerRepository();
    const { UserId } = await import('@/domain/valueObjects/UserId');
    const userId = new UserId(session.user.id);

    const trackers = await repository.findByUserId(userId);

    return NextResponse.json({
      trackers: trackers.map((t) => ({
        id: t.id.value,
        name: t.name.value,
        type: t.type,
        description: t.description,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('Get trackers error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch trackers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, description } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    const repository = new PrismaTrackerRepository();
    const useCase = new CreateTracker(repository);

    const result = await useCase.execute({
      userId: session.user.id,
      name,
      type,
      description: description || null,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const tracker = result.tracker!;
    console.log('[POST /api/trackers] Created tracker with ID:', tracker.id.value);
    console.log('[POST /api/trackers] User ID:', session.user.id);

    return NextResponse.json(
      {
        tracker: {
          id: tracker.id.value,
          name: tracker.name.value,
          type: tracker.type,
          description: tracker.description,
          createdAt: tracker.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create tracker error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create tracker' },
      { status: 500 }
    );
  }
}
