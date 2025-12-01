import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateEntry } from '../../../../../src/application/usecases/entry/UpdateEntry';
import { AddEntry } from '../../../../../src/application/usecases/entry/AddEntry';
import { MockEntryRepository } from '../../mocks/MockEntryRepository';
import { MockTrackerRepository } from '../../mocks/MockTrackerRepository';
import { Tracker } from '../../../../../src/domain/entities/Tracker';
import { TrackerId } from '../../../../../src/domain/valueObjects/TrackerId';
import { UserId } from '../../../../../src/domain/valueObjects/UserId';
import { TrackerName } from '../../../../../src/domain/valueObjects/TrackerName';
import { TrackerType } from '../../../../../src/domain/valueObjects/TrackerType';

describe('UpdateEntry Use Case', () => {
  let entryRepository: MockEntryRepository;
  let trackerRepository: MockTrackerRepository;
  let addEntryUseCase: AddEntry;
  let updateEntryUseCase: UpdateEntry;

  beforeEach(() => {
    entryRepository = new MockEntryRepository();
    trackerRepository = new MockTrackerRepository();
    addEntryUseCase = new AddEntry(entryRepository, trackerRepository);
    updateEntryUseCase = new UpdateEntry(entryRepository, trackerRepository);
  });

  describe('Update Value', () => {
    it('should update boolean entry value', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      await trackerRepository.save(tracker);

      const addResult = await addEntryUseCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: true },
        recordedAt: new Date('2024-01-01'),
      });

      const result = await updateEntryUseCase.execute({
        entryId: addResult.entry.id,
        value: { type: 'BOOLEAN', value: false },
      });

      expect(result.success).toBe(true);
      expect(result.entry.value.rawValue).toBe(false);
      expect(result.entry.value.displayValue).toBe('No');
    });

    it('should update number entry value', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Weight'),
        TrackerType.NUMBER
      );
      await trackerRepository.save(tracker);

      const addResult = await addEntryUseCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'NUMBER', value: 75.5 },
        recordedAt: new Date(),
      });

      const result = await updateEntryUseCase.execute({
        entryId: addResult.entry.id,
        value: { type: 'NUMBER', value: 76.0 },
      });

      expect(result.entry.value.rawValue).toBe(76.0);
    });

    it('should update text entry value', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Mood'),
        TrackerType.TEXT
      );
      await trackerRepository.save(tracker);

      const addResult = await addEntryUseCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'TEXT', value: 'Happy' },
        recordedAt: new Date(),
      });

      const result = await updateEntryUseCase.execute({
        entryId: addResult.entry.id,
        value: { type: 'TEXT', value: 'Very Happy' },
      });

      expect(result.entry.value.rawValue).toBe('Very Happy');
    });

    it('should update duration entry value', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Workout'),
        TrackerType.DURATION
      );
      await trackerRepository.save(tracker);

      const addResult = await addEntryUseCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'DURATION', value: '01:30' },
        recordedAt: new Date(),
      });

      const result = await updateEntryUseCase.execute({
        entryId: addResult.entry.id,
        value: { type: 'DURATION', value: '02:00' },
      });

      expect(result.entry.value.rawValue).toBe(120);
      expect(result.entry.value.displayValue).toBe('02:00');
    });

    it('should update currency entry value', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Expenses'),
        TrackerType.CURRENCY
      );
      await trackerRepository.save(tracker);

      const addResult = await addEntryUseCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'CURRENCY', value: 15.50 },
        recordedAt: new Date(),
      });

      const result = await updateEntryUseCase.execute({
        entryId: addResult.entry.id,
        value: { type: 'CURRENCY', value: 20.00 },
      });

      expect(result.entry.value.rawValue).toBe(2000);
      expect(result.entry.value.displayValue).toBe('€20.00');
    });
  });

  describe('Update RecordedAt', () => {
    it('should update recordedAt date', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      await trackerRepository.save(tracker);

      const addResult = await addEntryUseCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: true },
        recordedAt: new Date('2024-01-01'),
      });

      const newDate = new Date('2024-01-02');
      const result = await updateEntryUseCase.execute({
        entryId: addResult.entry.id,
        recordedAt: newDate,
      });

      expect(result.entry.recordedAt).toEqual(newDate);
    });

    it('should throw error if new recordedAt is in the future', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      await trackerRepository.save(tracker);

      const addResult = await addEntryUseCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: true },
        recordedAt: new Date('2024-01-01'),
      });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      await expect(
        updateEntryUseCase.execute({
          entryId: addResult.entry.id,
          recordedAt: futureDate,
        })
      ).rejects.toThrow('Entry cannot be recorded in the future');
    });
  });

  describe('Update Note', () => {
    it('should update note', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      await trackerRepository.save(tracker);

      const addResult = await addEntryUseCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: true },
        recordedAt: new Date(),
        note: 'Original note',
      });

      const result = await updateEntryUseCase.execute({
        entryId: addResult.entry.id,
        note: 'Updated note',
      });

      expect(result.entry.note).toBe('Updated note');
    });

    it('should remove note when set to null', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      await trackerRepository.save(tracker);

      const addResult = await addEntryUseCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: true },
        recordedAt: new Date(),
        note: 'Original note',
      });

      const result = await updateEntryUseCase.execute({
        entryId: addResult.entry.id,
        note: undefined,
      });

      expect(result.entry.note).toBeNull();
    });
  });

  describe('Update Multiple Fields', () => {
    it('should update value and note together', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      await trackerRepository.save(tracker);

      const addResult = await addEntryUseCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: true },
        recordedAt: new Date(),
      });

      const result = await updateEntryUseCase.execute({
        entryId: addResult.entry.id,
        value: { type: 'BOOLEAN', value: false },
        note: 'Updated both',
      });

      expect(result.entry.value.rawValue).toBe(false);
      expect(result.entry.note).toBe('Updated both');
    });

    it('should update all fields together', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      await trackerRepository.save(tracker);

      const addResult = await addEntryUseCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: true },
        recordedAt: new Date('2024-01-01'),
        note: 'Original',
      });

      const newDate = new Date('2024-01-02');
      const result = await updateEntryUseCase.execute({
        entryId: addResult.entry.id,
        value: { type: 'BOOLEAN', value: false },
        recordedAt: newDate,
        note: 'Updated all',
      });

      expect(result.entry.value.rawValue).toBe(false);
      expect(result.entry.recordedAt).toEqual(newDate);
      expect(result.entry.note).toBe('Updated all');
    });
  });

  describe('Validation', () => {
    it('should throw error if entry does not exist', async () => {
      await expect(
        updateEntryUseCase.execute({
          entryId: 'non-existent',
          value: { type: 'BOOLEAN', value: true },
        })
      ).rejects.toThrow('Entry not found');
    });

    it('should throw error if new value type does not match tracker type', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      await trackerRepository.save(tracker);

      const addResult = await addEntryUseCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: true },
        recordedAt: new Date(),
      });

      await expect(
        updateEntryUseCase.execute({
          entryId: addResult.entry.id,
          value: { type: 'NUMBER', value: 42 },
        })
      ).rejects.toThrow('Entry type NUMBER does not match tracker type BOOLEAN');
    });
  });

  describe('Entry Preservation', () => {
    it('should preserve existing fields when updating only one field', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      await trackerRepository.save(tracker);

      const originalDate = new Date('2024-01-01');
      const addResult = await addEntryUseCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: true },
        recordedAt: originalDate,
        note: 'Original note',
      });

      const result = await updateEntryUseCase.execute({
        entryId: addResult.entry.id,
        value: { type: 'BOOLEAN', value: false },
      });

      expect(result.entry.recordedAt).toEqual(originalDate);
      expect(result.entry.note).toBe('Original note');
    });

    it('should preserve entry id and createdAt', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      await trackerRepository.save(tracker);

      const addResult = await addEntryUseCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: true },
        recordedAt: new Date(),
      });

      const originalId = addResult.entry.id;
      const originalCreatedAt = addResult.entry.createdAt;

      const result = await updateEntryUseCase.execute({
        entryId: addResult.entry.id,
        value: { type: 'BOOLEAN', value: false },
      });

      expect(result.entry.id).toBe(originalId);
      expect(result.entry.createdAt).toEqual(originalCreatedAt);
    });
  });
});
