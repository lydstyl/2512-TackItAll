import { describe, it, expect } from 'vitest';
import { Entry } from '../../../../src/domain/entities/Entry';
import { EntryId } from '../../../../src/domain/valueObjects/EntryId';
import { TrackerId } from '../../../../src/domain/valueObjects/TrackerId';
import {
  BooleanValue,
  NumberValue,
  TextValue,
  DurationValue,
  CurrencyValue,
} from '../../../../src/domain/valueObjects/EntryValue';

describe('Entry Entity', () => {
  describe('Creation', () => {
    it('should create entry with boolean value', () => {
      const id = new EntryId('entry-123');
      const trackerId = new TrackerId('tracker-123');
      const value = new BooleanValue(true);
      const recordedAt = new Date('2024-01-01');
      const createdAt = new Date('2024-01-02');

      const entry = new Entry(id, trackerId, value, recordedAt, null, createdAt);

      expect(entry.id).toBe(id);
      expect(entry.trackerId).toBe(trackerId);
      expect(entry.value).toBe(value);
      expect(entry.recordedAt).toBe(recordedAt);
      expect(entry.note).toBeNull();
      expect(entry.createdAt).toBe(createdAt);
    });

    it('should create entry with number value', () => {
      const value = new NumberValue(42.5);
      const entry = new Entry(
        new EntryId('entry-123'),
        new TrackerId('tracker-123'),
        value,
        new Date()
      );

      expect(entry.value).toBe(value);
      expect(entry.value.getRawValue()).toBe(42.5);
    });

    it('should create entry with text value', () => {
      const value = new TextValue('Feeling great today!');
      const entry = new Entry(
        new EntryId('entry-123'),
        new TrackerId('tracker-123'),
        value,
        new Date()
      );

      expect(entry.value).toBe(value);
      expect(entry.value.getRawValue()).toBe('Feeling great today!');
    });

    it('should create entry with duration value', () => {
      const value = new DurationValue(90); // 1h 30min
      const entry = new Entry(
        new EntryId('entry-123'),
        new TrackerId('tracker-123'),
        value,
        new Date()
      );

      expect(entry.value).toBe(value);
      expect(entry.value.getRawValue()).toBe(90);
      expect(entry.value.getDisplayValue()).toBe('01:30');
    });

    it('should create entry with currency value', () => {
      const value = CurrencyValue.fromEuros(15.50);
      const entry = new Entry(
        new EntryId('entry-123'),
        new TrackerId('tracker-123'),
        value,
        new Date()
      );

      expect(entry.value).toBe(value);
      expect(entry.value.getRawValue()).toBe(1550); // cents
      expect(entry.value.getDisplayValue()).toBe('€15.50');
    });

    it('should create entry with note', () => {
      const entry = new Entry(
        new EntryId('entry-123'),
        new TrackerId('tracker-123'),
        new BooleanValue(true),
        new Date(),
        'Morning workout completed'
      );

      expect(entry.note).toBe('Morning workout completed');
    });

    it('should create entry with current date if not provided', () => {
      const before = new Date();
      const entry = new Entry(
        new EntryId('entry-123'),
        new TrackerId('tracker-123'),
        new BooleanValue(true),
        new Date()
      );
      const after = new Date();

      expect(entry.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(entry.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('Properties', () => {
    it('should have readonly properties', () => {
      const entry = new Entry(
        new EntryId('entry-123'),
        new TrackerId('tracker-123'),
        new BooleanValue(true),
        new Date()
      );

      expect(entry.id).toBeDefined();
      expect(entry.trackerId).toBeDefined();
      expect(entry.value).toBeDefined();
      expect(entry.recordedAt).toBeDefined();
      expect(entry.createdAt).toBeDefined();
    });

    it('should expose entry id value', () => {
      const entryId = new EntryId('entry-123');
      const entry = new Entry(
        entryId,
        new TrackerId('tracker-123'),
        new BooleanValue(true),
        new Date()
      );

      expect(entry.id.value).toBe('entry-123');
    });

    it('should expose tracker id value', () => {
      const trackerId = new TrackerId('tracker-123');
      const entry = new Entry(
        new EntryId('entry-123'),
        trackerId,
        new BooleanValue(true),
        new Date()
      );

      expect(entry.trackerId.value).toBe('tracker-123');
    });
  });

  describe('RecordedAt vs CreatedAt', () => {
    it('should allow recordedAt to be in the past', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const entry = new Entry(
        new EntryId('entry-123'),
        new TrackerId('tracker-123'),
        new BooleanValue(true),
        yesterday
      );

      expect(entry.recordedAt).toBe(yesterday);
      expect(entry.recordedAt.getTime()).toBeLessThan(entry.createdAt.getTime());
    });

    it('should track when event occurred vs when entry was created', () => {
      const eventTime = new Date('2024-01-01T10:00:00');
      const creationTime = new Date('2024-01-01T20:00:00');

      const entry = new Entry(
        new EntryId('entry-123'),
        new TrackerId('tracker-123'),
        new NumberValue(75.5),
        eventTime,
        null,
        creationTime
      );

      expect(entry.recordedAt).toBe(eventTime);
      expect(entry.createdAt).toBe(creationTime);
      expect(entry.createdAt.getTime()).toBeGreaterThan(entry.recordedAt.getTime());
    });
  });

  describe('Value Types', () => {
    it('should store boolean value correctly', () => {
      const entry = new Entry(
        new EntryId('entry-123'),
        new TrackerId('tracker-123'),
        new BooleanValue(false),
        new Date()
      );

      expect(entry.value.getRawValue()).toBe(false);
      expect(entry.value.getDisplayValue()).toBe('No');
    });

    it('should store duration in minutes', () => {
      const entry = new Entry(
        new EntryId('entry-123'),
        new TrackerId('tracker-123'),
        DurationValue.fromHHMM('02:30'),
        new Date()
      );

      expect(entry.value.getRawValue()).toBe(150); // minutes
    });

    it('should store currency in cents', () => {
      const entry = new Entry(
        new EntryId('entry-123'),
        new TrackerId('tracker-123'),
        CurrencyValue.fromEuros(25.99),
        new Date()
      );

      expect(entry.value.getRawValue()).toBe(2599); // cents
    });
  });

  describe('Equality', () => {
    it('should be equal when ids are equal', () => {
      const id = new EntryId('entry-123');
      const entry1 = new Entry(
        id,
        new TrackerId('tracker-123'),
        new BooleanValue(true),
        new Date()
      );
      const entry2 = new Entry(
        id,
        new TrackerId('tracker-456'),
        new BooleanValue(false),
        new Date()
      );

      expect(entry1.equals(entry2)).toBe(true);
    });

    it('should not be equal when ids are different', () => {
      const entry1 = new Entry(
        new EntryId('entry-123'),
        new TrackerId('tracker-123'),
        new BooleanValue(true),
        new Date()
      );
      const entry2 = new Entry(
        new EntryId('entry-456'),
        new TrackerId('tracker-123'),
        new BooleanValue(true),
        new Date()
      );

      expect(entry1.equals(entry2)).toBe(false);
    });
  });

  describe('Belongs to Tracker', () => {
    it('should track which tracker the entry belongs to', () => {
      const trackerId = new TrackerId('tracker-123');
      const entry = new Entry(
        new EntryId('entry-123'),
        trackerId,
        new BooleanValue(true),
        new Date()
      );

      expect(entry.trackerId).toBe(trackerId);
      expect(entry.trackerId.value).toBe('tracker-123');
    });
  });
});
