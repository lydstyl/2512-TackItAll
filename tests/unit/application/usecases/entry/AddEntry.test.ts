import { describe, it, expect, beforeEach } from 'vitest';
import { AddEntry } from '../../../../../src/application/usecases/entry/AddEntry';
import { MockEntryRepository } from '../../mocks/MockEntryRepository';
import { MockTrackerRepository } from '../../mocks/MockTrackerRepository';
import { Tracker } from '../../../../../src/domain/entities/Tracker';
import { TrackerId } from '../../../../../src/domain/valueObjects/TrackerId';
import { EntryId } from '../../../../../src/domain/valueObjects/EntryId';
import { UserId } from '../../../../../src/domain/valueObjects/UserId';
import { TrackerName } from '../../../../../src/domain/valueObjects/TrackerName';
import { TrackerType } from '../../../../../src/domain/valueObjects/TrackerType';

describe('AddEntry Use Case', () => {
  let entryRepository: MockEntryRepository;
  let trackerRepository: MockTrackerRepository;
  let useCase: AddEntry;

  beforeEach(() => {
    entryRepository = new MockEntryRepository();
    trackerRepository = new MockTrackerRepository();
    useCase = new AddEntry(entryRepository, trackerRepository);
  });

  describe('Boolean Entries', () => {
    it('should add boolean entry to boolean tracker', async () => {
      // Setup: Create a boolean tracker
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Daily Exercise'),
        TrackerType.BOOLEAN
      );
      await trackerRepository.save(tracker);

      const result = await useCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: true },
        recordedAt: new Date('2024-01-01T10:00:00'),
        note: 'Morning workout',
      });

      expect(result.success).toBe(true);
      expect(result.entry.value.type).toBe('BOOLEAN');
      expect(result.entry.value.rawValue).toBe(true);
      expect(result.entry.value.displayValue).toBe('Yes');
      expect(result.entry.note).toBe('Morning workout');
      expect(entryRepository.count()).toBe(1);
    });

    it('should add false boolean entry', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      await trackerRepository.save(tracker);

      const result = await useCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: false },
        recordedAt: new Date(),
      });

      expect(result.entry.value.rawValue).toBe(false);
      expect(result.entry.value.displayValue).toBe('No');
    });
  });

  describe('Number Entries', () => {
    it('should add number entry to number tracker', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Weight'),
        TrackerType.NUMBER
      );
      await trackerRepository.save(tracker);

      const result = await useCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'NUMBER', value: 75.5, decimals: 1 },
        recordedAt: new Date(),
      });

      expect(result.success).toBe(true);
      expect(result.entry.value.rawValue).toBe(75.5);
      expect(result.entry.value.displayValue).toBe('75.5');
    });

    it('should handle integer numbers', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Steps'),
        TrackerType.NUMBER
      );
      await trackerRepository.save(tracker);

      const result = await useCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'NUMBER', value: 10000 },
        recordedAt: new Date(),
      });

      expect(result.entry.value.rawValue).toBe(10000);
    });
  });

  describe('Text Entries', () => {
    it('should add text entry to text tracker', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Daily Mood'),
        TrackerType.TEXT
      );
      await trackerRepository.save(tracker);

      const result = await useCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'TEXT', value: 'Feeling great today!' },
        recordedAt: new Date(),
      });

      expect(result.success).toBe(true);
      expect(result.entry.value.rawValue).toBe('Feeling great today!');
      expect(result.entry.value.displayValue).toBe('Feeling great today!');
    });

    it('should handle empty text', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Notes'),
        TrackerType.TEXT
      );
      await trackerRepository.save(tracker);

      const result = await useCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'TEXT', value: '' },
        recordedAt: new Date(),
      });

      expect(result.entry.value.rawValue).toBe('');
    });
  });

  describe('Duration Entries (HH:MM)', () => {
    it('should add duration entry stored as minutes', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Workout Time'),
        TrackerType.DURATION
      );
      await trackerRepository.save(tracker);

      const result = await useCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'DURATION', value: '02:30' }, // HH:MM format
        recordedAt: new Date(),
      });

      expect(result.success).toBe(true);
      expect(result.entry.value.rawValue).toBe(150); // 2*60 + 30 = 150 minutes
      expect(result.entry.value.displayValue).toBe('02:30');
    });

    it('should handle short durations', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Meditation'),
        TrackerType.DURATION
      );
      await trackerRepository.save(tracker);

      const result = await useCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'DURATION', value: '00:15' },
        recordedAt: new Date(),
      });

      expect(result.entry.value.rawValue).toBe(15);
      expect(result.entry.value.displayValue).toBe('00:15');
    });

    it('should handle long durations', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Work Hours'),
        TrackerType.DURATION
      );
      await trackerRepository.save(tracker);

      const result = await useCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'DURATION', value: '08:45' },
        recordedAt: new Date(),
      });

      expect(result.entry.value.rawValue).toBe(525); // 8*60 + 45
    });
  });

  describe('Currency Entries (EUR)', () => {
    it('should add currency entry stored as cents', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Daily Expenses'),
        TrackerType.CURRENCY
      );
      await trackerRepository.save(tracker);

      const result = await useCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'CURRENCY', value: 15.50 }, // in euros
        recordedAt: new Date(),
      });

      expect(result.success).toBe(true);
      expect(result.entry.value.rawValue).toBe(1550); // stored as cents
      expect(result.entry.value.displayValue).toBe('€15.50');
    });

    it('should handle whole euro amounts', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Expenses'),
        TrackerType.CURRENCY
      );
      await trackerRepository.save(tracker);

      const result = await useCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'CURRENCY', value: 50 },
        recordedAt: new Date(),
      });

      expect(result.entry.value.rawValue).toBe(5000);
      expect(result.entry.value.displayValue).toBe('€50.00');
    });

    it('should handle small amounts', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Coffee'),
        TrackerType.CURRENCY
      );
      await trackerRepository.save(tracker);

      const result = await useCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'CURRENCY', value: 2.50 },
        recordedAt: new Date(),
      });

      expect(result.entry.value.rawValue).toBe(250);
    });
  });

  describe('Type Validation', () => {
    it('should throw error when entry type does not match tracker type', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      await trackerRepository.save(tracker);

      await expect(
        useCase.execute({
          trackerId: 'tracker-1',
          value: { type: 'NUMBER', value: 42 }, // Wrong type!
          recordedAt: new Date(),
        })
      ).rejects.toThrow('Entry type NUMBER does not match tracker type BOOLEAN');
    });

    it('should throw error for text entry on number tracker', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Weight'),
        TrackerType.NUMBER
      );
      await trackerRepository.save(tracker);

      await expect(
        useCase.execute({
          trackerId: 'tracker-1',
          value: { type: 'TEXT', value: 'invalid' },
          recordedAt: new Date(),
        })
      ).rejects.toThrow('Entry type TEXT does not match tracker type NUMBER');
    });
  });

  describe('Date Validation', () => {
    it('should throw error if recordedAt is in the future', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      await trackerRepository.save(tracker);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      await expect(
        useCase.execute({
          trackerId: 'tracker-1',
          value: { type: 'BOOLEAN', value: true },
          recordedAt: futureDate,
        })
      ).rejects.toThrow('Entry cannot be recorded in the future');
    });

    it('should allow recordedAt in the past', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      await trackerRepository.save(tracker);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const result = await useCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: true },
        recordedAt: yesterday,
      });

      expect(result.success).toBe(true);
      expect(result.entry.recordedAt).toEqual(yesterday);
    });

    it('should allow recordedAt as current time', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      await trackerRepository.save(tracker);

      const now = new Date();
      const result = await useCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: true },
        recordedAt: now,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Tracker Validation', () => {
    it('should throw error if tracker does not exist', async () => {
      await expect(
        useCase.execute({
          trackerId: 'non-existent',
          value: { type: 'BOOLEAN', value: true },
          recordedAt: new Date(),
        })
      ).rejects.toThrow('Tracker not found');
    });
  });

  describe('Entry Properties', () => {
    it('should generate unique entry id', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      await trackerRepository.save(tracker);

      const result1 = await useCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: true },
        recordedAt: new Date(),
      });

      const result2 = await useCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: false },
        recordedAt: new Date(),
      });

      expect(result1.entry.id).not.toBe(result2.entry.id);
    });

    it('should set createdAt timestamp', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      await trackerRepository.save(tracker);

      const before = new Date();
      const result = await useCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: true },
        recordedAt: new Date(),
      });
      const after = new Date();

      expect(result.entry.createdAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      );
      expect(result.entry.createdAt.getTime()).toBeLessThanOrEqual(
        after.getTime()
      );
    });

    it('should handle optional note', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      await trackerRepository.save(tracker);

      const result = await useCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: true },
        recordedAt: new Date(),
      });

      expect(result.entry.note).toBeNull();
    });
  });

  describe('Repository Integration', () => {
    it('should save entry to repository', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      await trackerRepository.save(tracker);

      const result = await useCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: true },
        recordedAt: new Date(),
      });

      expect(entryRepository.count()).toBe(1);
      const entryId = new EntryId(result.entry.id);
      expect(await entryRepository.exists(entryId)).toBe(true);
    });

    it('should allow multiple entries for same tracker', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      await trackerRepository.save(tracker);

      await useCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: true },
        recordedAt: new Date('2024-01-01'),
      });

      await useCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: false },
        recordedAt: new Date('2024-01-02'),
      });

      expect(entryRepository.count()).toBe(2);
    });
  });
});
