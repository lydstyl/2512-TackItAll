import { describe, it, expect } from 'vitest';
import {
  EntryValue,
  BooleanValue,
  NumberValue,
  TextValue,
  DurationValue,
  CurrencyValue,
} from '../../../../src/domain/valueObjects/EntryValue';
import { TrackerType } from '../../../../src/domain/valueObjects/TrackerType';

describe('EntryValue Polymorphic Value Objects', () => {
  describe('BooleanValue', () => {
    it('should create boolean value true', () => {
      const value = new BooleanValue(true);
      expect(value.getType()).toBe(TrackerType.BOOLEAN);
      expect(value.getRawValue()).toBe(true);
      expect(value.getDisplayValue()).toBe('Yes');
    });

    it('should create boolean value false', () => {
      const value = new BooleanValue(false);
      expect(value.getRawValue()).toBe(false);
      expect(value.getDisplayValue()).toBe('No');
    });
  });

  describe('NumberValue', () => {
    it('should create number value with integer', () => {
      const value = new NumberValue(42);
      expect(value.getType()).toBe(TrackerType.NUMBER);
      expect(value.getRawValue()).toBe(42);
      expect(value.getDisplayValue()).toBe('42');
    });

    it('should create number value with decimal', () => {
      const value = new NumberValue(3.14159);
      expect(value.getRawValue()).toBe(3.14159);
      expect(value.getDisplayValue()).toBe('3.14159');
    });

    it('should handle decimals parameter for display', () => {
      const value = new NumberValue(3.14159, 2);
      expect(value.getDisplayValue()).toBe('3.14');
    });

    it('should handle negative numbers', () => {
      const value = new NumberValue(-10.5);
      expect(value.getRawValue()).toBe(-10.5);
    });
  });

  describe('TextValue', () => {
    it('should create text value', () => {
      const value = new TextValue('Hello World');
      expect(value.getType()).toBe(TrackerType.TEXT);
      expect(value.getRawValue()).toBe('Hello World');
      expect(value.getDisplayValue()).toBe('Hello World');
    });

    it('should handle empty text', () => {
      const value = new TextValue('');
      expect(value.getRawValue()).toBe('');
    });

    it('should handle multiline text', () => {
      const text = 'Line 1\nLine 2\nLine 3';
      const value = new TextValue(text);
      expect(value.getRawValue()).toBe(text);
    });
  });

  describe('DurationValue', () => {
    it('should create duration from minutes', () => {
      const value = new DurationValue(150); // 2h 30min
      expect(value.getType()).toBe(TrackerType.DURATION);
      expect(value.getRawValue()).toBe(150);
      expect(value.getDisplayValue()).toBe('02:30');
    });

    it('should create duration from HH:MM format', () => {
      const value = DurationValue.fromHHMM('01:45');
      expect(value.getRawValue()).toBe(105); // 1*60 + 45
      expect(value.getDisplayValue()).toBe('01:45');
    });

    it('should handle zero duration', () => {
      const value = new DurationValue(0);
      expect(value.getDisplayValue()).toBe('00:00');
    });

    it('should handle large durations', () => {
      const value = new DurationValue(1440); // 24 hours
      expect(value.getDisplayValue()).toBe('24:00');
    });

    it('should pad single digit hours and minutes', () => {
      const value = new DurationValue(65); // 1h 5min
      expect(value.getDisplayValue()).toBe('01:05');
    });

    it('should parse HH:MM with leading zeros', () => {
      const value = DurationValue.fromHHMM('00:05');
      expect(value.getRawValue()).toBe(5);
    });

    it('should handle hours > 24', () => {
      const value = DurationValue.fromHHMM('36:15');
      expect(value.getRawValue()).toBe(2175); // 36*60 + 15
    });
  });

  describe('CurrencyValue', () => {
    it('should create currency from cents', () => {
      const value = new CurrencyValue(1550); // €15.50
      expect(value.getType()).toBe(TrackerType.CURRENCY);
      expect(value.getRawValue()).toBe(1550);
      expect(value.getDisplayValue()).toBe('€15.50');
    });

    it('should create currency from euros', () => {
      const value = CurrencyValue.fromEuros(25.99);
      expect(value.getRawValue()).toBe(2599);
      expect(value.getDisplayValue()).toBe('€25.99');
      expect(value.getEuros()).toBe(25.99);
    });

    it('should handle zero currency', () => {
      const value = new CurrencyValue(0);
      expect(value.getDisplayValue()).toBe('€0.00');
      expect(value.getEuros()).toBe(0);
    });

    it('should handle large amounts', () => {
      const value = CurrencyValue.fromEuros(1234.56);
      expect(value.getRawValue()).toBe(123456);
      expect(value.getDisplayValue()).toBe('€1234.56');
    });

    it('should round euros to cents correctly', () => {
      const value = CurrencyValue.fromEuros(10.995); // Should round to 1100 cents
      expect(value.getRawValue()).toBe(1100);
      expect(value.getEuros()).toBe(11);
    });

    it('should handle negative amounts', () => {
      const value = CurrencyValue.fromEuros(-5.50);
      expect(value.getRawValue()).toBe(-550);
      expect(value.getDisplayValue()).toBe('€-5.50');
    });

    it('should always display two decimal places', () => {
      const value = CurrencyValue.fromEuros(10);
      expect(value.getDisplayValue()).toBe('€10.00');
    });
  });
});
