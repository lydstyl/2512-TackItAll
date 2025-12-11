import { Tracker as PrismaTracker } from '@prisma/client';
import { Tracker } from '@/domain/entities/Tracker';
import { TrackerId } from '@/domain/valueObjects/TrackerId';
import { UserId } from '@/domain/valueObjects/UserId';
import { TrackerName } from '@/domain/valueObjects/TrackerName';
import { TrackerType } from '@/domain/valueObjects/TrackerType';

export class TrackerMapper {
  static toDomain(prismaTracker: PrismaTracker): Tracker {
    return new Tracker(
      new TrackerId(prismaTracker.id),
      new UserId(prismaTracker.userId),
      new TrackerName(prismaTracker.name),
      prismaTracker.type as TrackerType,
      prismaTracker.description,
      prismaTracker.createdAt,
      prismaTracker.updatedAt
    );
  }

  static toPrisma(tracker: Tracker): Omit<PrismaTracker, 'createdAt' | 'updatedAt'> {
    return {
      id: tracker.id.value,
      userId: tracker.userId.value,
      name: tracker.name.value,
      type: tracker.type,
      description: tracker.description,
    };
  }
}
