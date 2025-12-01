import { IEntryRepository } from '../../../domain/repositories/IEntryRepository';
import { ITrackerRepository } from '../../../domain/repositories/ITrackerRepository';
import { TrackerId } from '../../../domain/valueObjects/TrackerId';
import { TrackerType } from '../../../domain/valueObjects/TrackerType';
import {
  GetTrackerStatsDTO,
  TrackerStatsDTO,
  BooleanStatsDTO,
  NumberStatsDTO,
  TextStatsDTO,
  DurationStatsDTO,
  CurrencyStatsDTO,
} from '../../dto/StatsDTO';
import { BooleanValue, NumberValue, DurationValue, CurrencyValue } from '../../../domain/valueObjects/EntryValue';

export interface GetTrackerStatsResult {
  success: boolean;
  stats: TrackerStatsDTO;
}

/**
 * Use case for getting tracker statistics
 * Calculates different statistics based on tracker type
 */
export class GetTrackerStats {
  constructor(
    private readonly entryRepository: IEntryRepository,
    private readonly trackerRepository: ITrackerRepository
  ) {}

  async execute(dto: GetTrackerStatsDTO): Promise<GetTrackerStatsResult> {
    // Validate tracker exists
    const trackerId = new TrackerId(dto.trackerId);
    const tracker = await this.trackerRepository.findById(trackerId);
    if (!tracker) {
      throw new Error('Tracker not found');
    }

    // Get entries (with optional date range)
    let entries;
    if (dto.startDate && dto.endDate) {
      entries = await this.entryRepository.findByTrackerIdAndDateRange(
        trackerId,
        dto.startDate,
        dto.endDate
      );
    } else {
      entries = await this.entryRepository.findByTrackerId(trackerId);
    }

    // Calculate statistics based on tracker type
    let stats: TrackerStatsDTO;

    switch (tracker.type) {
      case TrackerType.BOOLEAN:
        stats = this.calculateBooleanStats(entries);
        break;

      case TrackerType.NUMBER:
        stats = this.calculateNumberStats(entries);
        break;

      case TrackerType.TEXT:
        stats = this.calculateTextStats(entries);
        break;

      case TrackerType.DURATION:
        stats = this.calculateDurationStats(entries);
        break;

      case TrackerType.CURRENCY:
        stats = this.calculateCurrencyStats(entries);
        break;

      default:
        throw new Error(`Unknown tracker type: ${tracker.type}`);
    }

    return {
      success: true,
      stats,
    };
  }

  private calculateBooleanStats(entries: any[]): BooleanStatsDTO {
    const totalEntries = entries.length;
    const trueCount = entries.filter((e) => {
      const value = e.value as BooleanValue;
      return value.getRawValue() === true;
    }).length;
    const falseCount = totalEntries - trueCount;

    const truePercentage = totalEntries > 0 ? Math.round((trueCount / totalEntries) * 100) : 0;
    const falsePercentage = totalEntries > 0 ? Math.round((falseCount / totalEntries) * 100) : 0;

    return {
      type: 'BOOLEAN',
      totalEntries,
      trueCount,
      falseCount,
      truePercentage,
      falsePercentage,
    };
  }

  private calculateNumberStats(entries: any[]): NumberStatsDTO {
    const totalEntries = entries.length;

    if (totalEntries === 0) {
      return {
        type: 'NUMBER',
        totalEntries: 0,
        sum: 0,
        average: 0,
        min: 0,
        max: 0,
      };
    }

    const values = entries.map((e) => {
      const value = e.value as NumberValue;
      return value.getRawValue();
    });

    const sum = values.reduce((acc, val) => acc + val, 0);
    const average = sum / totalEntries;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      type: 'NUMBER',
      totalEntries,
      sum,
      average,
      min,
      max,
    };
  }

  private calculateTextStats(entries: any[]): TextStatsDTO {
    return {
      type: 'TEXT',
      totalEntries: entries.length,
    };
  }

  private calculateDurationStats(entries: any[]): DurationStatsDTO {
    const totalEntries = entries.length;

    if (totalEntries === 0) {
      return {
        type: 'DURATION',
        totalEntries: 0,
        totalMinutes: 0,
        averageMinutes: 0,
        totalDisplay: '00:00',
        averageDisplay: '00:00',
      };
    }

    const minutes = entries.map((e) => {
      const value = e.value as DurationValue;
      return value.getRawValue();
    });

    const totalMinutes = minutes.reduce((acc, val) => acc + val, 0);
    const averageMinutes = totalMinutes / totalEntries;

    return {
      type: 'DURATION',
      totalEntries,
      totalMinutes,
      averageMinutes,
      totalDisplay: this.formatMinutesToHHMM(totalMinutes),
      averageDisplay: this.formatMinutesToHHMM(Math.floor(averageMinutes)),
    };
  }

  private calculateCurrencyStats(entries: any[]): CurrencyStatsDTO {
    const totalEntries = entries.length;

    if (totalEntries === 0) {
      return {
        type: 'CURRENCY',
        totalEntries: 0,
        totalCents: 0,
        averageCents: 0,
        totalDisplay: '€0.00',
        averageDisplay: '€0.00',
      };
    }

    const cents = entries.map((e) => {
      const value = e.value as CurrencyValue;
      return value.getRawValue();
    });

    const totalCents = cents.reduce((acc, val) => acc + val, 0);
    const averageCents = totalCents / totalEntries;

    return {
      type: 'CURRENCY',
      totalEntries,
      totalCents,
      averageCents,
      totalDisplay: this.formatCentsToEuro(totalCents),
      averageDisplay: this.formatCentsToEuro(Math.round(averageCents)),
    };
  }

  private formatMinutesToHHMM(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private formatCentsToEuro(cents: number): string {
    return `€${(cents / 100).toFixed(2)}`;
  }
}
