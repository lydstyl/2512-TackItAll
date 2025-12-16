import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaTrackerRepository } from '@/infrastructure/prisma/repositories/PrismaTrackerRepository';
import { TrackerId } from '@/domain/valueObjects/TrackerId';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const repository = new PrismaTrackerRepository();
    const tracker = await repository.findById(new TrackerId(id));

    if (!tracker) {
      return NextResponse.json({ error: 'Tracker not found' }, { status: 404 });
    }

    // Check ownership
    if (tracker.userId.value !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      tracker: {
        id: tracker.id.value,
        name: tracker.name.value,
        type: tracker.type,
        description: tracker.description,
        createdAt: tracker.createdAt.toISOString(),
        updatedAt: tracker.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Get tracker error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tracker' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const repository = new PrismaTrackerRepository();
    const tracker = await repository.findById(new TrackerId(id));

    if (!tracker) {
      return NextResponse.json({ error: 'Tracker not found' }, { status: 404 });
    }

    // Check ownership
    if (tracker.userId.value !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await repository.delete(tracker.id);

    return NextResponse.json({ message: 'Tracker deleted successfully' });
  } catch (error: any) {
    console.error('Delete tracker error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete tracker' },
      { status: 500 }
    );
  }
}
