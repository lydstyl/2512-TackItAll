import { prisma } from '@/infrastructure/prisma/client';
import { ITrackerRepository } from '@/domain/repositories/ITrackerRepository';
import { Tracker } from '@/domain/entities/Tracker';
import { TrackerId } from '@/domain/valueObjects/TrackerId';
import { UserId } from '@/domain/valueObjects/UserId';
import { TrackerMapper } from '@/infrastructure/prisma/mappers/TrackerMapper';

export class PrismaTrackerRepository implements ITrackerRepository {
  async save(tracker: Tracker): Promise<void> {
    const prismaData = TrackerMapper.toPrisma(tracker);

    console.log('[PrismaTrackerRepository.save] Saving tracker with ID:', tracker.id.value);
    console.log('[PrismaTrackerRepository.save] Tracker data:', prismaData);

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

    console.log('[PrismaTrackerRepository.save] Tracker saved successfully');
  }

  async findById(id: TrackerId): Promise<Tracker | null> {
    console.log('[PrismaTrackerRepository.findById] Looking for tracker with ID:', id.value);

    const prismaTracker = await prisma.tracker.findUnique({
      where: { id: id.value },
    });

    console.log('[PrismaTrackerRepository.findById] Tracker found:', prismaTracker ? 'YES' : 'NO');
    if (prismaTracker) {
      console.log('[PrismaTrackerRepository.findById] Tracker data:', {
        id: prismaTracker.id,
        name: prismaTracker.name,
        userId: prismaTracker.userId,
      });
    }

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
