import { describe, it, expect } from 'vitest';
import { TrackerName } from '../../../../src/domain/valueObjects/TrackerName';

describe('TrackerName Value Object', () => {
  describe('Valid tracker names', () => {
    it('should create a tracker name with valid value', () => {
      const name = new TrackerName('Daily Exercise');
      expect(name.value).toBe('Daily Exercise');
    });

    it('should create tracker name with single character', () => {
      const name = new TrackerName('A');
      expect(name.value).toBe('A');
    });

    it('should create tracker name with numbers', () => {
      const name = new TrackerName('Workout 2024');
      expect(name.value).toBe('Workout 2024');
    });

    it('should create tracker name at max length (100 chars)', () => {
      const longName = 'A'.repeat(100);
      const name = new TrackerName(longName);
      expect(name.value).toBe(longName);
      expect(name.value.length).toBe(100);
    });

    it('should trim whitespace from tracker name', () => {
      const name = new TrackerName('  Daily Exercise  ');
      expect(name.value).toBe('Daily Exercise');
    });
  });

  describe('Invalid tracker names', () => {
    it('should throw error for empty string', () => {
      expect(() => new TrackerName('')).toThrow('Tracker name cannot be empty');
    });

    it('should throw error for whitespace-only string', () => {
      expect(() => new TrackerName('   ')).toThrow('Tracker name cannot be empty');
    });

    it('should throw error for name exceeding 100 characters', () => {
      const tooLong = 'A'.repeat(101);
      expect(() => new TrackerName(tooLong)).toThrow('Tracker name cannot exceed 100 characters');
    });
  });

  describe('Equality', () => {
    it('should be equal for same values', () => {
      const name1 = new TrackerName('Daily Exercise');
      const name2 = new TrackerName('Daily Exercise');
      expect(name1.equals(name2)).toBe(true);
    });

    it('should not be equal for different values', () => {
      const name1 = new TrackerName('Daily Exercise');
      const name2 = new TrackerName('Morning Walk');
      expect(name1.equals(name2)).toBe(false);
    });
  });
});
