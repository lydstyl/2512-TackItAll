import { describe, it, expect } from 'vitest';
import { UserId } from '../../../../src/domain/valueObjects/UserId';

describe('UserId', () => {
  describe('constructor', () => {
    it('should create a UserId with a valid value', () => {
      const id = new UserId('123e4567-e89b-12d3-a456-426614174000');
      expect(id.value).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should throw error when value is empty string', () => {
      expect(() => new UserId('')).toThrow('UserId cannot be empty');
    });

    it('should throw error when value is whitespace only', () => {
      expect(() => new UserId('   ')).toThrow('UserId cannot be empty');
    });

    it('should throw error when value is undefined', () => {
      expect(() => new UserId(undefined as any)).toThrow('UserId cannot be empty');
    });

    it('should throw error when value is null', () => {
      expect(() => new UserId(null as any)).toThrow('UserId cannot be empty');
    });

    it('should accept any non-empty string as valid ID', () => {
      const id1 = new UserId('abc123');
      const id2 = new UserId('user_12345');
      const id3 = new UserId('550e8400-e29b-41d4-a716-446655440000');

      expect(id1.value).toBe('abc123');
      expect(id2.value).toBe('user_12345');
      expect(id3.value).toBe('550e8400-e29b-41d4-a716-446655440000');
    });
  });

  describe('equals', () => {
    it('should return true for UserIds with same value', () => {
      const id1 = new UserId('123e4567-e89b-12d3-a456-426614174000');
      const id2 = new UserId('123e4567-e89b-12d3-a456-426614174000');

      expect(id1.equals(id2)).toBe(true);
    });

    it('should return false for UserIds with different values', () => {
      const id1 = new UserId('123e4567-e89b-12d3-a456-426614174000');
      const id2 = new UserId('987e6543-e21b-98d3-a654-426614174999');

      expect(id1.equals(id2)).toBe(false);
    });

    it('should be reflexive (id.equals(id) is true)', () => {
      const id = new UserId('123e4567-e89b-12d3-a456-426614174000');

      expect(id.equals(id)).toBe(true);
    });

    it('should be symmetric (if a.equals(b) then b.equals(a))', () => {
      const id1 = new UserId('123e4567-e89b-12d3-a456-426614174000');
      const id2 = new UserId('123e4567-e89b-12d3-a456-426614174000');

      expect(id1.equals(id2)).toBe(id2.equals(id1));
    });
  });
});
