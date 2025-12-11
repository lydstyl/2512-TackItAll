import { prisma } from '@/infrastructure/prisma/client';
import { IEntryRepository } from '@/domain/repositories/IEntryRepository';
import { Entry } from '@/domain/entities/Entry';
import { EntryId } from '@/domain/valueObjects/EntryId';
import { TrackerId } from '@/domain/valueObjects/TrackerId';
import { TrackerType } from '@/domain/valueObjects/TrackerType';
import { EntryMapper } from '@/infrastructure/prisma/mappers/EntryMapper';

export class PrismaEntryRepository implements IEntryRepository {
  async save(entry: Entry): Promise<void> {
    const prismaData = EntryMapper.toPrisma(entry);

    await prisma.entry.upsert({
      where: { id: entry.id.value },
      create: {
        ...prismaData,
        createdAt: entry.createdAt,
      },
      update: {
        recordedAt: prismaData.recordedAt,
        note: prismaData.note,
        boolValue: prismaData.boolValue,
        numValue: prismaData.numValue,
        textValue: prismaData.textValue,
        intValue: prismaData.intValue,
      },
    });
  }

  async findById(id: EntryId): Promise<Entry | null> {
    const prismaEntry = await prisma.entry.findUnique({
      where: { id: id.value },
      include: { tracker: true },
    });

    if (!prismaEntry) {
      return null;
    }

    return EntryMapper.toDomain(
      prismaEntry,
      prismaEntry.tracker.type as TrackerType
    );
  }

  async findByTrackerId(trackerId: TrackerId): Promise<Entry[]> {
    const prismaEntries = await prisma.entry.findMany({
      where: { trackerId: trackerId.value },
      include: { tracker: true },
      orderBy: { recordedAt: 'desc' },
    });

    return prismaEntries.map((entry) =>
      EntryMapper.toDomain(entry, entry.tracker.type as TrackerType)
    );
  }

  async findByTrackerIdAndDateRange(
    trackerId: TrackerId,
    startDate: Date,
    endDate: Date
  ): Promise<Entry[]> {
    const prismaEntries = await prisma.entry.findMany({
      where: {
        trackerId: trackerId.value,
        recordedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { tracker: true },
      orderBy: { recordedAt: 'desc' },
    });

    return prismaEntries.map((entry) =>
      EntryMapper.toDomain(entry, entry.tracker.type as TrackerType)
    );
  }

  async delete(id: EntryId): Promise<void> {
    await prisma.entry.delete({
      where: { id: id.value },
    });
  }

  async exists(id: EntryId): Promise<boolean> {
    const count = await prisma.entry.count({
      where: { id: id.value },
    });

    return count > 0;
  }

  async countByTrackerId(trackerId: TrackerId): Promise<number> {
    return prisma.entry.count({
      where: { trackerId: trackerId.value },
    });
  }
}
