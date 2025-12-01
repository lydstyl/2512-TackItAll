import { describe, it, expect, beforeEach } from 'vitest';
import { GetTrackerStats } from '../../../../../src/application/usecases/stats/GetTrackerStats';
import { AddEntry } from '../../../../../src/application/usecases/entry/AddEntry';
import { MockEntryRepository } from '../../mocks/MockEntryRepository';
import { MockTrackerRepository } from '../../mocks/MockTrackerRepository';
import { Tracker } from '../../../../../src/domain/entities/Tracker';
import { TrackerId } from '../../../../../src/domain/valueObjects/TrackerId';
import { UserId } from '../../../../../src/domain/valueObjects/UserId';
import { TrackerName } from '../../../../../src/domain/valueObjects/TrackerName';
import { TrackerType } from '../../../../../src/domain/valueObjects/TrackerType';

describe('GetTrackerStats Use Case', () => {
  let entryRepository: MockEntryRepository;
  let trackerRepository: MockTrackerRepository;
  let addEntryUseCase: AddEntry;
  let getStatsUseCase: GetTrackerStats;

  beforeEach(() => {
    entryRepository = new MockEntryRepository();
    trackerRepository = new MockTrackerRepository();
    addEntryUseCase = new AddEntry(entryRepository, trackerRepository);
    getStatsUseCase = new GetTrackerStats(entryRepository, trackerRepository);
  });

  describe('Boolean Tracker Statistics', () => {
    it('should calculate boolean statistics with mixed values', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      await trackerRepository.save(tracker);

      // Add 7 true, 3 false entries
      for (let i = 0; i < 7; i++) {
        await addEntryUseCase.execute({
          trackerId: 'tracker-1',
          value: { type: 'BOOLEAN', value: true },
          recordedAt: new Date(`2024-01-${i + 1}`),
        });
      }

      for (let i = 0; i < 3; i++) {
        await addEntryUseCase.execute({
          trackerId: 'tracker-1',
          value: { type: 'BOOLEAN', value: false },
          recordedAt: new Date(`2024-01-${i + 10}`),
        });
      }

      const result = await getStatsUseCase.execute({
        trackerId: 'tracker-1',
      });

      expect(result.stats.type).toBe('BOOLEAN');
      if (result.stats.type === 'BOOLEAN') {
        expect(result.stats.totalEntries).toBe(10);
        expect(result.stats.trueCount).toBe(7);
        expect(result.stats.falseCount).toBe(3);
        expect(result.stats.truePercentage).toBe(70);
        expect(result.stats.falsePercentage).toBe(30);
      }
    });

    it('should handle all true values', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      await trackerRepository.save(tracker);

      for (let i = 0; i < 5; i++) {
        await addEntryUseCase.execute({
          trackerId: 'tracker-1',
          value: { type: 'BOOLEAN', value: true },
          recordedAt: new Date(`2024-01-${i + 1}`),
        });
      }

      const result = await getStatsUseCase.execute({
        trackerId: 'tracker-1',
      });

      if (result.stats.type === 'BOOLEAN') {
        expect(result.stats.trueCount).toBe(5);
        expect(result.stats.falseCount).toBe(0);
        expect(result.stats.truePercentage).toBe(100);
        expect(result.stats.falsePercentage).toBe(0);
      }
    });

    it('should handle no entries', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      await trackerRepository.save(tracker);

      const result = await getStatsUseCase.execute({
        trackerId: 'tracker-1',
      });

      if (result.stats.type === 'BOOLEAN') {
        expect(result.stats.totalEntries).toBe(0);
        expect(result.stats.trueCount).toBe(0);
        expect(result.stats.falseCount).toBe(0);
        expect(result.stats.truePercentage).toBe(0);
        expect(result.stats.falsePercentage).toBe(0);
      }
    });
  });

  describe('Number Tracker Statistics', () => {
    it('should calculate number statistics', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Weight'),
        TrackerType.NUMBER
      );
      await trackerRepository.save(tracker);

      const values = [70, 71.5, 72, 69.5, 73];
      for (let i = 0; i < values.length; i++) {
        await addEntryUseCase.execute({
          trackerId: 'tracker-1',
          value: { type: 'NUMBER', value: values[i] },
          recordedAt: new Date(`2024-01-${i + 1}`),
        });
      }

      const result = await getStatsUseCase.execute({
        trackerId: 'tracker-1',
      });

      expect(result.stats.type).toBe('NUMBER');
      if (result.stats.type === 'NUMBER') {
        expect(result.stats.totalEntries).toBe(5);
        expect(result.stats.sum).toBe(356);
        expect(result.stats.average).toBe(71.2);
        expect(result.stats.min).toBe(69.5);
        expect(result.stats.max).toBe(73);
      }
    });

    it('should handle single entry', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Weight'),
        TrackerType.NUMBER
      );
      await trackerRepository.save(tracker);

      await addEntryUseCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'NUMBER', value: 75.5 },
        recordedAt: new Date(),
      });

      const result = await getStatsUseCase.execute({
        trackerId: 'tracker-1',
      });

      if (result.stats.type === 'NUMBER') {
        expect(result.stats.totalEntries).toBe(1);
        expect(result.stats.sum).toBe(75.5);
        expect(result.stats.average).toBe(75.5);
        expect(result.stats.min).toBe(75.5);
        expect(result.stats.max).toBe(75.5);
      }
    });
  });

  describe('Text Tracker Statistics', () => {
    it('should calculate text statistics', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Mood'),
        TrackerType.TEXT
      );
      await trackerRepository.save(tracker);

      const moods = ['Happy', 'Sad', 'Excited', 'Calm'];
      for (let i = 0; i < moods.length; i++) {
        await addEntryUseCase.execute({
          trackerId: 'tracker-1',
          value: { type: 'TEXT', value: moods[i] },
          recordedAt: new Date(`2024-01-${i + 1}`),
        });
      }

      const result = await getStatsUseCase.execute({
        trackerId: 'tracker-1',
      });

      expect(result.stats.type).toBe('TEXT');
      if (result.stats.type === 'TEXT') {
        expect(result.stats.totalEntries).toBe(4);
      }
    });
  });

  describe('Duration Tracker Statistics', () => {
    it('should calculate duration statistics', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Workout'),
        TrackerType.DURATION
      );
      await trackerRepository.save(tracker);

      const durations = ['01:30', '02:00', '01:15', '02:30'];
      for (let i = 0; i < durations.length; i++) {
        await addEntryUseCase.execute({
          trackerId: 'tracker-1',
          value: { type: 'DURATION', value: durations[i] },
          recordedAt: new Date(`2024-01-${i + 1}`),
        });
      }

      const result = await getStatsUseCase.execute({
        trackerId: 'tracker-1',
      });

      expect(result.stats.type).toBe('DURATION');
      if (result.stats.type === 'DURATION') {
        expect(result.stats.totalEntries).toBe(4);
        expect(result.stats.totalMinutes).toBe(435); // 90 + 120 + 75 + 150
        expect(result.stats.averageMinutes).toBe(108.75); // 435 / 4
        expect(result.stats.totalDisplay).toBe('07:15');
        expect(result.stats.averageDisplay).toBe('01:48');
      }
    });

    it('should handle single duration entry', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Workout'),
        TrackerType.DURATION
      );
      await trackerRepository.save(tracker);

      await addEntryUseCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'DURATION', value: '02:30' },
        recordedAt: new Date(),
      });

      const result = await getStatsUseCase.execute({
        trackerId: 'tracker-1',
      });

      if (result.stats.type === 'DURATION') {
        expect(result.stats.totalMinutes).toBe(150);
        expect(result.stats.averageMinutes).toBe(150);
        expect(result.stats.totalDisplay).toBe('02:30');
        expect(result.stats.averageDisplay).toBe('02:30');
      }
    });
  });

  describe('Currency Tracker Statistics', () => {
    it('should calculate currency statistics', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Expenses'),
        TrackerType.CURRENCY
      );
      await trackerRepository.save(tracker);

      const amounts = [15.50, 20.00, 12.75, 8.50];
      for (let i = 0; i < amounts.length; i++) {
        await addEntryUseCase.execute({
          trackerId: 'tracker-1',
          value: { type: 'CURRENCY', value: amounts[i] },
          recordedAt: new Date(`2024-01-${i + 1}`),
        });
      }

      const result = await getStatsUseCase.execute({
        trackerId: 'tracker-1',
      });

      expect(result.stats.type).toBe('CURRENCY');
      if (result.stats.type === 'CURRENCY') {
        expect(result.stats.totalEntries).toBe(4);
        expect(result.stats.totalCents).toBe(5675); // 1550 + 2000 + 1275 + 850
        expect(result.stats.averageCents).toBe(1418.75);
        expect(result.stats.totalDisplay).toBe('€56.75');
        expect(result.stats.averageDisplay).toBe('€14.19');
      }
    });
  });

  describe('Date Range Filtering', () => {
    it('should filter entries by date range', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      await trackerRepository.save(tracker);

      // Add entries across different dates
      await addEntryUseCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: true },
        recordedAt: new Date('2024-01-01'),
      });

      await addEntryUseCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: true },
        recordedAt: new Date('2024-01-05'),
      });

      await addEntryUseCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: false },
        recordedAt: new Date('2024-01-10'),
      });

      await addEntryUseCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: true },
        recordedAt: new Date('2024-01-15'),
      });

      // Get stats for Jan 5-12 (should include 2 entries)
      const result = await getStatsUseCase.execute({
        trackerId: 'tracker-1',
        startDate: new Date('2024-01-05'),
        endDate: new Date('2024-01-12'),
      });

      if (result.stats.type === 'BOOLEAN') {
        expect(result.stats.totalEntries).toBe(2);
        expect(result.stats.trueCount).toBe(1);
        expect(result.stats.falseCount).toBe(1);
      }
    });
  });

  describe('Validation', () => {
    it('should throw error if tracker does not exist', async () => {
      await expect(
        getStatsUseCase.execute({
          trackerId: 'non-existent',
        })
      ).rejects.toThrow('Tracker not found');
    });
  });
});
