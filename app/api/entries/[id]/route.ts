import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { UpdateEntry } from '@/application/usecases/entry/UpdateEntry';
import { DeleteEntry } from '@/application/usecases/entry/DeleteEntry';
import { PrismaTrackerRepository } from '@/infrastructure/prisma/repositories/PrismaTrackerRepository';
import { PrismaEntryRepository } from '@/infrastructure/prisma/repositories/PrismaEntryRepository';
import { EntryId } from '@/domain/valueObjects/EntryId';

export async function PATCH(
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

    const trackerRepo = new PrismaTrackerRepository();
    const entryRepo = new PrismaEntryRepository();

    // Verify entry exists and user owns it
    const entry = await entryRepo.findById(new EntryId(id));
    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const tracker = await trackerRepo.findById(entry.trackerId);
    if (!tracker || tracker.userId.value !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const useCase = new UpdateEntry(trackerRepo, entryRepo);

    const result = await useCase.execute({
      entryId: id,
      value,
      recordedAt: recordedAt ? new Date(recordedAt) : undefined,
      note: note !== undefined ? note : undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const updatedEntry = result.entry!;
    return NextResponse.json({
      entry: {
        id: updatedEntry.id.value,
        trackerId: updatedEntry.trackerId.value,
        value: updatedEntry.value.getRawValue(),
        displayValue: updatedEntry.value.getDisplayValue(),
        type: updatedEntry.value.getType(),
        recordedAt: updatedEntry.recordedAt.toISOString(),
        note: updatedEntry.note,
        createdAt: updatedEntry.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Update entry error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update entry' },
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
    const trackerRepo = new PrismaTrackerRepository();
    const entryRepo = new PrismaEntryRepository();

    // Verify entry exists and user owns it
    const entry = await entryRepo.findById(new EntryId(id));
    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const tracker = await trackerRepo.findById(entry.trackerId);
    if (!tracker || tracker.userId.value !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const useCase = new DeleteEntry(entryRepo);
    const result = await useCase.execute({ entryId: id });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: 'Entry deleted successfully' });
  } catch (error: any) {
    console.error('Delete entry error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete entry' },
      { status: 500 }
    );
  }
}
