import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { GetTrackerStats } from '@/application/usecases/stats/GetTrackerStats';
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
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

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

    const useCase = new GetTrackerStats(trackerRepo, entryRepo);

    const result = await useCase.execute({
      trackerId: id,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      stats: result.stats,
      trackerType: tracker.type,
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
