import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { AddEntry } from '@/application/usecases/entry/AddEntry';
import { PrismaTrackerRepository } from '@/infrastructure/prisma/repositories/PrismaTrackerRepository';
import { PrismaEntryRepository } from '@/infrastructure/prisma/repositories/PrismaEntryRepository';
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
    const trackerRepo = new PrismaTrackerRepository();
    const entryRepo = new PrismaEntryRepository();

    const tracker = await trackerRepo.findById(new TrackerId(id));
    if (!tracker) {
      return NextResponse.json({ error: 'Tracker not found' }, { status: 404 });
    }

    // Check ownership
    if (tracker.userId.value !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const entries = await entryRepo.findByTrackerId(tracker.id);

    return NextResponse.json({
      entries: entries.map((e) => ({
        id: e.id.value,
        trackerId: e.trackerId.value,
        value: e.value.getRawValue(),
        displayValue: e.value.getDisplayValue(),
        type: e.value.getType(),
        recordedAt: e.recordedAt.toISOString(),
        note: e.note,
        createdAt: e.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('Get entries error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { value, recordedAt, note } = body;

    if (value === undefined || value === null) {
      return NextResponse.json({ error: 'Value is required' }, { status: 400 });
    }

    const trackerRepo = new PrismaTrackerRepository();
    const entryRepo = new PrismaEntryRepository();

    // Verify tracker exists and user owns it
    const tracker = await trackerRepo.findById(new TrackerId(id));
    if (!tracker) {
      return NextResponse.json({ error: 'Tracker not found' }, { status: 404 });
    }

    if (tracker.userId.value !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const useCase = new AddEntry(trackerRepo, entryRepo);

    const result = await useCase.execute({
      trackerId: id,
      value,
      recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
      note: note || null,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const entry = result.entry!;
    return NextResponse.json(
      {
        entry: {
          id: entry.id.value,
          trackerId: entry.trackerId.value,
          value: entry.value.getRawValue(),
          displayValue: entry.value.getDisplayValue(),
          type: entry.value.getType(),
          recordedAt: entry.recordedAt.toISOString(),
          note: entry.note,
          createdAt: entry.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Add entry error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add entry' },
      { status: 500 }
    );
  }
}
