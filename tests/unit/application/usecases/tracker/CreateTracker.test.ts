import { describe, it, expect, beforeEach } from 'vitest';
import { CreateTracker } from '../../../../../src/application/usecases/tracker/CreateTracker';
import { MockTrackerRepository } from '../../mocks/MockTrackerRepository';
import { TrackerType } from '../../../../../src/domain/valueObjects/TrackerType';
import { TrackerId } from '../../../../../src/domain/valueObjects/TrackerId';

describe('CreateTracker Use Case', () => {
  let repository: MockTrackerRepository;
  let useCase: CreateTracker;

  beforeEach(() => {
    repository = new MockTrackerRepository();
    useCase = new CreateTracker(repository);
  });

  describe('Successful Creation', () => {
    it('should create a boolean tracker', async () => {
      const result = await useCase.execute({
        userId: 'user-123',
        name: 'Daily Exercise',
        type: TrackerType.BOOLEAN,
        description: 'Did I exercise today?',
      });

      expect(result.success).toBe(true);
      expect(result.tracker).toBeDefined();
      expect(result.tracker.name).toBe('Daily Exercise');
      expect(result.tracker.type).toBe(TrackerType.BOOLEAN);
      expect(result.tracker.description).toBe('Did I exercise today?');
      expect(result.tracker.userId).toBe('user-123');
      expect(repository.count()).toBe(1);
    });

    it('should create a number tracker', async () => {
      const result = await useCase.execute({
        userId: 'user-123',
        name: 'Weight',
        type: TrackerType.NUMBER,
        description: 'Track my weight in kg',
      });

      expect(result.success).toBe(true);
      expect(result.tracker.type).toBe(TrackerType.NUMBER);
    });

    it('should create a text tracker', async () => {
      const result = await useCase.execute({
        userId: 'user-123',
        name: 'Daily Mood',
        type: TrackerType.TEXT,
        description: 'How am I feeling today?',
      });

      expect(result.success).toBe(true);
      expect(result.tracker.type).toBe(TrackerType.TEXT);
    });

    it('should create a duration tracker', async () => {
      const result = await useCase.execute({
        userId: 'user-123',
        name: 'Workout Time',
        type: TrackerType.DURATION,
        description: 'How long did I workout?',
      });

      expect(result.success).toBe(true);
      expect(result.tracker.type).toBe(TrackerType.DURATION);
    });

    it('should create a currency tracker', async () => {
      const result = await useCase.execute({
        userId: 'user-123',
        name: 'Daily Expenses',
        type: TrackerType.CURRENCY,
        description: 'How much did I spend today?',
      });

      expect(result.success).toBe(true);
      expect(result.tracker.type).toBe(TrackerType.CURRENCY);
    });

    it('should create tracker without description', async () => {
      const result = await useCase.execute({
        userId: 'user-123',
        name: 'Simple Tracker',
        type: TrackerType.BOOLEAN,
      });

      expect(result.success).toBe(true);
      expect(result.tracker.description).toBeNull();
    });

    it('should generate unique tracker id', async () => {
      const result1 = await useCase.execute({
        userId: 'user-123',
        name: 'Tracker 1',
        type: TrackerType.BOOLEAN,
      });

      const result2 = await useCase.execute({
        userId: 'user-123',
        name: 'Tracker 2',
        type: TrackerType.NUMBER,
      });

      expect(result1.tracker.id).not.toBe(result2.tracker.id);
      expect(repository.count()).toBe(2);
    });

    it('should set createdAt and updatedAt', async () => {
      const before = new Date();
      const result = await useCase.execute({
        userId: 'user-123',
        name: 'Test Tracker',
        type: TrackerType.BOOLEAN,
      });
      const after = new Date();

      expect(result.tracker.createdAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      );
      expect(result.tracker.createdAt.getTime()).toBeLessThanOrEqual(
        after.getTime()
      );
      expect(result.tracker.updatedAt).toEqual(result.tracker.createdAt);
    });
  });

  describe('Validation', () => {
    it('should throw error for empty tracker name', async () => {
      await expect(
        useCase.execute({
          userId: 'user-123',
          name: '',
          type: TrackerType.BOOLEAN,
        })
      ).rejects.toThrow('Tracker name cannot be empty');
    });

    it('should throw error for whitespace-only tracker name', async () => {
      await expect(
        useCase.execute({
          userId: 'user-123',
          name: '   ',
          type: TrackerType.BOOLEAN,
        })
      ).rejects.toThrow('Tracker name cannot be empty');
    });

    it('should throw error for tracker name exceeding 100 characters', async () => {
      const longName = 'A'.repeat(101);
      await expect(
        useCase.execute({
          userId: 'user-123',
          name: longName,
          type: TrackerType.BOOLEAN,
        })
      ).rejects.toThrow('Tracker name cannot exceed 100 characters');
    });

    it('should throw error for empty user id', async () => {
      await expect(
        useCase.execute({
          userId: '',
          name: 'Test Tracker',
          type: TrackerType.BOOLEAN,
        })
      ).rejects.toThrow('UserId cannot be empty');
    });

    it('should trim tracker name whitespace', async () => {
      const result = await useCase.execute({
        userId: 'user-123',
        name: '  Daily Exercise  ',
        type: TrackerType.BOOLEAN,
      });

      expect(result.tracker.name).toBe('Daily Exercise');
    });
  });

  describe('Multiple Users', () => {
    it('should allow different users to create trackers with same name', async () => {
      const result1 = await useCase.execute({
        userId: 'user-123',
        name: 'Exercise',
        type: TrackerType.BOOLEAN,
      });

      const result2 = await useCase.execute({
        userId: 'user-456',
        name: 'Exercise',
        type: TrackerType.BOOLEAN,
      });

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.tracker.userId).not.toBe(result2.tracker.userId);
      expect(repository.count()).toBe(2);
    });
  });

  describe('Repository Integration', () => {
    it('should save tracker to repository', async () => {
      const result = await useCase.execute({
        userId: 'user-123',
        name: 'Test Tracker',
        type: TrackerType.BOOLEAN,
      });

      const trackerId = new TrackerId(result.tracker.id);
      const saved = await repository.findById(trackerId);
      expect(saved).not.toBeNull();
      expect(saved?.name.value).toBe('Test Tracker');
    });

    it('should allow retrieving saved tracker by id', async () => {
      const result = await useCase.execute({
        userId: 'user-123',
        name: 'Test Tracker',
        type: TrackerType.BOOLEAN,
      });

      const trackerId = new TrackerId(result.tracker.id);
      const exists = await repository.exists(trackerId);
      expect(exists).toBe(true);
    });
  });
});
