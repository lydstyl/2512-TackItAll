import { randomBytes } from 'crypto';
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
import { AddEntryDTO, EntryDTO } from '../../dto/EntryDTO';

export interface AddEntryResult {
  success: boolean;
  entry: EntryDTO;
}

/**
 * Use case for adding a new entry to a tracker
 * Validates tracker exists, type matches, and date is not in future
 */
export class AddEntry {
  constructor(
    private readonly entryRepository: IEntryRepository,
    private readonly trackerRepository: ITrackerRepository
  ) {}

  async execute(dto: AddEntryDTO): Promise<AddEntryResult> {
    // Validate tracker exists
    const trackerId = new TrackerId(dto.trackerId);
    const tracker = await this.trackerRepository.findById(trackerId);
    if (!tracker) {
      throw new Error('Tracker not found');
    }

    // Validate recordedAt is not in the future
    const now = new Date();
    if (dto.recordedAt > now) {
      throw new Error('Entry cannot be recorded in the future');
    }

    // Convert DTO value to domain EntryValue
    const entryValue = this.convertToEntryValue(dto.value);

    // Validate entry type matches tracker type
    if (entryValue.getType() !== tracker.type) {
      throw new Error(
        `Entry type ${dto.value.type} does not match tracker type ${tracker.type}`
      );
    }

    // Create entry entity
    const entryId = new EntryId(this.generateId());
    const entry = new Entry(
      entryId,
      trackerId,
      entryValue,
      dto.recordedAt,
      dto.note || null,
      new Date() // createdAt
    );

    // Save to repository
    await this.entryRepository.save(entry);

    // Return result DTO
    return {
      success: true,
      entry: {
        id: entry.id.value,
        trackerId: entry.trackerId.value,
        value: {
          type: entryValue.getType(),
          rawValue: entryValue.getRawValue(),
          displayValue: entryValue.getDisplayValue(),
        },
        recordedAt: entry.recordedAt,
        note: entry.note,
        createdAt: entry.createdAt,
      },
    };
  }

  /**
   * Convert DTO value to domain EntryValue based on type
   */
  private convertToEntryValue(valueDTO: AddEntryDTO['value']): EntryValue {
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

  /**
   * Generate a unique entry ID
   */
  private generateId(): string {
    return `entry_${randomBytes(16).toString('hex')}`;
  }
}
