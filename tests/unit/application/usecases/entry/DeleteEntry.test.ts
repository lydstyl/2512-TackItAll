import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteEntry } from '../../../../../src/application/usecases/entry/DeleteEntry';
import { AddEntry } from '../../../../../src/application/usecases/entry/AddEntry';
import { MockEntryRepository } from '../../mocks/MockEntryRepository';
import { MockTrackerRepository } from '../../mocks/MockTrackerRepository';
import { Tracker } from '../../../../../src/domain/entities/Tracker';
import { TrackerId } from '../../../../../src/domain/valueObjects/TrackerId';
import { EntryId } from '../../../../../src/domain/valueObjects/EntryId';
import { UserId } from '../../../../../src/domain/valueObjects/UserId';
import { TrackerName } from '../../../../../src/domain/valueObjects/TrackerName';
import { TrackerType } from '../../../../../src/domain/valueObjects/TrackerType';

describe('DeleteEntry Use Case', () => {
  let entryRepository: MockEntryRepository;
  let trackerRepository: MockTrackerRepository;
  let addEntryUseCase: AddEntry;
  let deleteEntryUseCase: DeleteEntry;

  beforeEach(() => {
    entryRepository = new MockEntryRepository();
    trackerRepository = new MockTrackerRepository();
    addEntryUseCase = new AddEntry(entryRepository, trackerRepository);
    deleteEntryUseCase = new DeleteEntry(entryRepository);
  });

  describe('Successful Deletion', () => {
    it('should delete an existing entry', async () => {
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

      expect(entryRepository.count()).toBe(1);

      const result = await deleteEntryUseCase.execute({
        entryId: addResult.entry.id,
      });

      expect(result.success).toBe(true);
      expect(entryRepository.count()).toBe(0);
    });

    it('should remove entry from repository', async () => {
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

      const entryId = new EntryId(addResult.entry.id);
      expect(await entryRepository.exists(entryId)).toBe(true);

      await deleteEntryUseCase.execute({
        entryId: addResult.entry.id,
      });

      expect(await entryRepository.exists(entryId)).toBe(false);
    });

    it('should delete only the specified entry', async () => {
      const tracker = new Tracker(
        new TrackerId('tracker-1'),
        new UserId('user-1'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      await trackerRepository.save(tracker);

      const entry1 = await addEntryUseCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: true },
        recordedAt: new Date('2024-01-01'),
      });

      const entry2 = await addEntryUseCase.execute({
        trackerId: 'tracker-1',
        value: { type: 'BOOLEAN', value: false },
        recordedAt: new Date('2024-01-02'),
      });

      expect(entryRepository.count()).toBe(2);

      await deleteEntryUseCase.execute({
        entryId: entry1.entry.id,
      });

      expect(entryRepository.count()).toBe(1);
      const entryId2 = new EntryId(entry2.entry.id);
      expect(await entryRepository.exists(entryId2)).toBe(true);
    });
  });

  describe('Multiple Entry Types', () => {
    it('should delete boolean entry', async () => {
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

      const result = await deleteEntryUseCase.execute({
        entryId: addResult.entry.id,
      });

      expect(result.success).toBe(true);
      expect(entryRepository.count()).toBe(0);
    });

    it('should delete number entry', async () => {
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

      await deleteEntryUseCase.execute({
        entryId: addResult.entry.id,
      });

      expect(entryRepository.count()).toBe(0);
    });

    it('should delete text entry', async () => {
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

      await deleteEntryUseCase.execute({
        entryId: addResult.entry.id,
      });

      expect(entryRepository.count()).toBe(0);
    });

    it('should delete duration entry', async () => {
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

      await deleteEntryUseCase.execute({
        entryId: addResult.entry.id,
      });

      expect(entryRepository.count()).toBe(0);
    });

    it('should delete currency entry', async () => {
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

      await deleteEntryUseCase.execute({
        entryId: addResult.entry.id,
      });

      expect(entryRepository.count()).toBe(0);
    });
  });

  describe('Validation', () => {
    it('should throw error if entry does not exist', async () => {
      await expect(
        deleteEntryUseCase.execute({
          entryId: 'non-existent',
        })
      ).rejects.toThrow('Entry not found');
    });

    it('should throw error for empty entry id', async () => {
      await expect(
        deleteEntryUseCase.execute({
          entryId: '',
        })
      ).rejects.toThrow();
    });
  });

  describe('Entry with Note', () => {
    it('should delete entry with note', async () => {
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
        note: 'Some note',
      });

      const result = await deleteEntryUseCase.execute({
        entryId: addResult.entry.id,
      });

      expect(result.success).toBe(true);
      expect(entryRepository.count()).toBe(0);
    });
  });
});
