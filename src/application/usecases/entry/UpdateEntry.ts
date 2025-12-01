import { IEntryRepository } from '../../../domain/repositories/IEntryRepository';
import { ITrackerRepository } from '../../../domain/repositories/ITrackerRepository';
import { Entry } from '../../../domain/entities/Entry';
import { EntryId } from '../../../domain/valueObjects/EntryId';
import { TrackerId } from '../../../domain/valueObjects/TrackerId';
import {
  EntryValue,
  BooleanValue,
  NumberValue,
  TextValue,
  DurationValue,
  CurrencyValue,
} from '../../../domain/valueObjects/EntryValue';
import { UpdateEntryDTO, EntryDTO } from '../../dto/EntryDTO';

export interface UpdateEntryResult {
  success: boolean;
  entry: EntryDTO;
}

/**
 * Use case for updating an existing entry
 * Can update value, recordedAt, and/or note
 * Preserves unchanged fields
 */
export class UpdateEntry {
  constructor(
    private readonly entryRepository: IEntryRepository,
    private readonly trackerRepository: ITrackerRepository
  ) {}

  async execute(dto: UpdateEntryDTO): Promise<UpdateEntryResult> {
    // Find existing entry
    const entryId = new EntryId(dto.entryId);
    const existingEntry = await this.entryRepository.findById(entryId);
    if (!existingEntry) {
      throw new Error('Entry not found');
    }

    // Determine new value (use existing or new)
    let newValue = existingEntry.value;
    if (dto.value) {
      // Convert DTO value to domain EntryValue
      newValue = this.convertToEntryValue(dto.value);

      // Validate new value type matches tracker type
      const tracker = await this.trackerRepository.findById(
        existingEntry.trackerId
      );
      if (!tracker) {
        throw new Error('Tracker not found');
      }

      if (newValue.getType() !== tracker.type) {
        throw new Error(
          `Entry type ${dto.value.type} does not match tracker type ${tracker.type}`
        );
      }
    }

    // Determine new recordedAt (use existing or new)
    let newRecordedAt = existingEntry.recordedAt;
    if (dto.recordedAt !== undefined) {
      // Validate recordedAt is not in the future
      const now = new Date();
      if (dto.recordedAt > now) {
        throw new Error('Entry cannot be recorded in the future');
      }
      newRecordedAt = dto.recordedAt;
    }

    // Determine new note (use existing or new, undefined means remove note)
    let newNote = existingEntry.note;
    if ('note' in dto) {
      newNote = dto.note || null;
    }

    // Create updated entry entity
    const updatedEntry = new Entry(
      existingEntry.id,
      existingEntry.trackerId,
      newValue,
      newRecordedAt,
      newNote,
      existingEntry.createdAt
    );

    // Save to repository
    await this.entryRepository.save(updatedEntry);

    // Return result DTO
    return {
      success: true,
      entry: {
        id: updatedEntry.id.value,
        trackerId: updatedEntry.trackerId.value,
        value: {
          type: newValue.getType(),
          rawValue: newValue.getRawValue(),
          displayValue: newValue.getDisplayValue(),
        },
        recordedAt: updatedEntry.recordedAt,
        note: updatedEntry.note,
        createdAt: updatedEntry.createdAt,
      },
    };
  }

  /**
   * Convert DTO value to domain EntryValue based on type
   */
  private convertToEntryValue(valueDTO: UpdateEntryDTO['value']): EntryValue {
    if (!valueDTO) {
      throw new Error('Value DTO is required');
    }

    switch (valueDTO.type) {
      case 'BOOLEAN':
        return new BooleanValue(valueDTO.value);

      case 'NUMBER':
        return new NumberValue(valueDTO.value, valueDTO.decimals);

      case 'TEXT':
        return new TextValue(valueDTO.value);

      case 'DURATION':
        return DurationValue.fromHHMM(valueDTO.value);

      case 'CURRENCY':
        return CurrencyValue.fromEuros(valueDTO.value);

      default:
        throw new Error(`Unknown entry type: ${(valueDTO as any).type}`);
    }
  }
}
