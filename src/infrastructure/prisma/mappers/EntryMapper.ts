import { Entry as PrismaEntry } from '@prisma/client';
import { Entry } from '@/domain/entities/Entry';
import { EntryId } from '@/domain/valueObjects/EntryId';
import { TrackerId } from '@/domain/valueObjects/TrackerId';
import {
  EntryValue,
  BooleanValue,
  NumberValue,
  TextValue,
  DurationValue,
  CurrencyValue,
} from '@/domain/valueObjects/EntryValue';
import { TrackerType } from '@/domain/valueObjects/TrackerType';

export class EntryMapper {
  /**
   * Converts a domain Entry to Prisma format
   * Maps polymorphic EntryValue to appropriate column based on type
   */
  static toPrisma(entry: Entry): Omit<PrismaEntry, 'createdAt'> {
    const baseData = {
      id: entry.id.value,
      trackerId: entry.trackerId.value,
      recordedAt: entry.recordedAt,
      note: entry.note,
      boolValue: null as boolean | null,
      numValue: null as number | null,
      textValue: null as string | null,
      intValue: null as number | null,
    };

    const valueType = entry.value.getType();
    const rawValue = entry.value.getRawValue();

    switch (valueType) {
      case TrackerType.BOOLEAN:
        baseData.boolValue = rawValue as boolean;
        break;
      case TrackerType.NUMBER:
        baseData.numValue = rawValue as number;
        break;
      case TrackerType.TEXT:
        baseData.textValue = rawValue as string;
        break;
      case TrackerType.DURATION:
        baseData.intValue = rawValue as number; // minutes
        break;
      case TrackerType.CURRENCY:
        baseData.intValue = rawValue as number; // cents
        break;
    }

    return baseData;
  }

  /**
   * Converts a Prisma Entry to domain Entry
   * Creates appropriate EntryValue subclass based on tracker type
   */
  static toDomain(prismaEntry: PrismaEntry, trackerType: TrackerType): Entry {
    const value = EntryMapper.createEntryValue(prismaEntry, trackerType);

    return new Entry(
      new EntryId(prismaEntry.id),
      new TrackerId(prismaEntry.trackerId),
      value,
      prismaEntry.recordedAt,
      prismaEntry.note,
      prismaEntry.createdAt
    );
  }

  /**
   * Creates the appropriate EntryValue subclass based on tracker type
   * Reads from the correct column based on type
   */
  private static createEntryValue(
    prismaEntry: PrismaEntry,
    trackerType: TrackerType
  ): EntryValue {
    switch (trackerType) {
      case TrackerType.BOOLEAN:
        if (prismaEntry.boolValue === null) {
          throw new Error(
            `Entry ${prismaEntry.id} has null boolValue for BOOLEAN tracker`
          );
        }
        return new BooleanValue(prismaEntry.boolValue);

      case TrackerType.NUMBER:
        if (prismaEntry.numValue === null) {
          throw new Error(
            `Entry ${prismaEntry.id} has null numValue for NUMBER tracker`
          );
        }
        return new NumberValue(prismaEntry.numValue);

      case TrackerType.TEXT:
        if (prismaEntry.textValue === null) {
          throw new Error(
            `Entry ${prismaEntry.id} has null textValue for TEXT tracker`
          );
        }
        return new TextValue(prismaEntry.textValue);

      case TrackerType.DURATION:
        if (prismaEntry.intValue === null) {
          throw new Error(
            `Entry ${prismaEntry.id} has null intValue for DURATION tracker`
          );
        }
        return new DurationValue(prismaEntry.intValue);

      case TrackerType.CURRENCY:
        if (prismaEntry.intValue === null) {
          throw new Error(
            `Entry ${prismaEntry.id} has null intValue for CURRENCY tracker`
          );
        }
        return new CurrencyValue(prismaEntry.intValue);

      default:
        throw new Error(`Unknown tracker type: ${trackerType}`);
    }
  }
}
