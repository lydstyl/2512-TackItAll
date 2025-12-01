import { describe, it, expect } from 'vitest';
import { Tracker } from '../../../../src/domain/entities/Tracker';
import { TrackerId } from '../../../../src/domain/valueObjects/TrackerId';
import { UserId } from '../../../../src/domain/valueObjects/UserId';
import { TrackerName } from '../../../../src/domain/valueObjects/TrackerName';
import { TrackerType } from '../../../../src/domain/valueObjects/TrackerType';

describe('Tracker Entity', () => {
  describe('Creation', () => {
    it('should create a tracker with all required fields', () => {
      const id = new TrackerId('tracker-123');
      const userId = new UserId('user-123');
      const name = new TrackerName('Daily Exercise');
      const type = TrackerType.BOOLEAN;
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const tracker = new Tracker(
        id,
        userId,
        name,
        type,
        null,
        createdAt,
        updatedAt
      );

      expect(tracker.id).toBe(id);
      expect(tracker.userId).toBe(userId);
      expect(tracker.name).toBe(name);
      expect(tracker.type).toBe(type);
      expect(tracker.description).toBeNull();
      expect(tracker.createdAt).toBe(createdAt);
      expect(tracker.updatedAt).toBe(updatedAt);
    });

    it('should create tracker with description', () => {
      const tracker = new Tracker(
        new TrackerId('tracker-123'),
        new UserId('user-123'),
        new TrackerName('Daily Exercise'),
        TrackerType.BOOLEAN,
        'Track if I exercised today'
      );

      expect(tracker.description).toBe('Track if I exercised today');
    });

    it('should create tracker with current dates if not provided', () => {
      const before = new Date();
      const tracker = new Tracker(
        new TrackerId('tracker-123'),
        new UserId('user-123'),
        new TrackerName('Daily Exercise'),
        TrackerType.BOOLEAN
      );
      const after = new Date();

      expect(tracker.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(tracker.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(tracker.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(tracker.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should create tracker for each type', () => {
      const types = [
        TrackerType.BOOLEAN,
        TrackerType.NUMBER,
        TrackerType.TEXT,
        TrackerType.DURATION,
        TrackerType.CURRENCY,
      ];

      types.forEach((type) => {
        const tracker = new Tracker(
          new TrackerId(`tracker-${type}`),
          new UserId('user-123'),
          new TrackerName(`Test ${type}`),
          type
        );

        expect(tracker.type).toBe(type);
      });
    });
  });

  describe('Properties', () => {
    it('should have readonly properties', () => {
      const tracker = new Tracker(
        new TrackerId('tracker-123'),
        new UserId('user-123'),
        new TrackerName('Daily Exercise'),
        TrackerType.BOOLEAN
      );

      expect(tracker.id).toBeDefined();
      expect(tracker.userId).toBeDefined();
      expect(tracker.name).toBeDefined();
      expect(tracker.type).toBeDefined();
    });

    it('should expose tracker name value', () => {
      const name = new TrackerName('Daily Exercise');
      const tracker = new Tracker(
        new TrackerId('tracker-123'),
        new UserId('user-123'),
        name,
        TrackerType.BOOLEAN
      );

      expect(tracker.name.value).toBe('Daily Exercise');
    });
  });

  describe('Type Validation', () => {
    it('should accept boolean type', () => {
      const tracker = new Tracker(
        new TrackerId('tracker-123'),
        new UserId('user-123'),
        new TrackerName('Did I exercise?'),
        TrackerType.BOOLEAN
      );

      expect(tracker.type).toBe(TrackerType.BOOLEAN);
    });

    it('should accept number type', () => {
      const tracker = new Tracker(
        new TrackerId('tracker-123'),
        new UserId('user-123'),
        new TrackerName('Weight'),
        TrackerType.NUMBER
      );

      expect(tracker.type).toBe(TrackerType.NUMBER);
    });

    it('should accept duration type', () => {
      const tracker = new Tracker(
        new TrackerId('tracker-123'),
        new UserId('user-123'),
        new TrackerName('Workout Time'),
        TrackerType.DURATION
      );

      expect(tracker.type).toBe(TrackerType.DURATION);
    });

    it('should accept currency type', () => {
      const tracker = new Tracker(
        new TrackerId('tracker-123'),
        new UserId('user-123'),
        new TrackerName('Daily Expenses'),
        TrackerType.CURRENCY
      );

      expect(tracker.type).toBe(TrackerType.CURRENCY);
    });
  });

  describe('Equality', () => {
    it('should be equal when ids are equal', () => {
      const id = new TrackerId('tracker-123');
      const tracker1 = new Tracker(
        id,
        new UserId('user-123'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      const tracker2 = new Tracker(
        id,
        new UserId('user-456'),
        new TrackerName('Different Name'),
        TrackerType.NUMBER
      );

      expect(tracker1.equals(tracker2)).toBe(true);
    });

    it('should not be equal when ids are different', () => {
      const tracker1 = new Tracker(
        new TrackerId('tracker-123'),
        new UserId('user-123'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );
      const tracker2 = new Tracker(
        new TrackerId('tracker-456'),
        new UserId('user-123'),
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );

      expect(tracker1.equals(tracker2)).toBe(false);
    });
  });

  describe('Ownership', () => {
    it('should track which user owns the tracker', () => {
      const userId = new UserId('user-123');
      const tracker = new Tracker(
        new TrackerId('tracker-123'),
        userId,
        new TrackerName('Exercise'),
        TrackerType.BOOLEAN
      );

      expect(tracker.userId).toBe(userId);
      expect(tracker.userId.value).toBe('user-123');
    });
  });
});
