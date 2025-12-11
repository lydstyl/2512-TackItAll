import { prisma } from '@/infrastructure/prisma/client';
import { ITrackerRepository } from '@/domain/repositories/ITrackerRepository';
import { Tracker } from '@/domain/entities/Tracker';
import { TrackerId } from '@/domain/valueObjects/TrackerId';
import { UserId } from '@/domain/valueObjects/UserId';
import { TrackerMapper } from '@/infrastructure/prisma/mappers/TrackerMapper';

export class PrismaTrackerRepository implements ITrackerRepository {
  async save(tracker: Tracker): Promise<void> {
    const prismaData = TrackerMapper.toPrisma(tracker);

    await prisma.tracker.upsert({
      where: { id: tracker.id.value },
      create: {
        ...prismaData,
        createdAt: tracker.createdAt,
        updatedAt: tracker.updatedAt,
      },
      update: {
        name: prismaData.name,
        description: prismaData.description,
        updatedAt: new Date(),
      },
    });
  }

  async findById(id: TrackerId): Promise<Tracker | null> {
    const prismaTracker = await prisma.tracker.findUnique({
      where: { id: id.value },
    });

    if (!prismaTracker) {
      return null;
    }

    return TrackerMapper.toDomain(prismaTracker);
  }

  async findByUserId(userId: UserId): Promise<Tracker[]> {
    const prismaTrackers = await prisma.tracker.findMany({
      where: { userId: userId.value },
      orderBy: { createdAt: 'desc' },
    });

    return prismaTrackers.map(TrackerMapper.toDomain);
  }

  async delete(id: TrackerId): Promise<void> {
    await prisma.tracker.delete({
      where: { id: id.value },
    });
  }

  async exists(id: TrackerId): Promise<boolean> {
    const count = await prisma.tracker.count({
      where: { id: id.value },
    });

    return count > 0;
  }
}
