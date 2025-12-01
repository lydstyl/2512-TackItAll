import { describe, it, expect } from 'vitest';
import { Email } from '../../../../src/domain/valueObjects/Email';

describe('Email Value Object', () => {
  describe('Valid emails', () => {
    it('should create an email with valid format', () => {
      const email = new Email('user@example.com');
      expect(email.value).toBe('user@example.com');
    });

    it('should accept email with subdomain', () => {
      const email = new Email('user@mail.example.com');
      expect(email.value).toBe('user@mail.example.com');
    });

    it('should accept email with numbers', () => {
      const email = new Email('user123@example.com');
      expect(email.value).toBe('user123@example.com');
    });

    it('should accept email with dots', () => {
      const email = new Email('user.name@example.com');
      expect(email.value).toBe('user.name@example.com');
    });
  });

  describe('Invalid emails', () => {
    it('should throw error for empty email', () => {
      expect(() => new Email('')).toThrow('Invalid email format');
    });

    it('should throw error for email without @', () => {
      expect(() => new Email('userexample.com')).toThrow('Invalid email format');
    });

    it('should throw error for email without domain', () => {
      expect(() => new Email('user@')).toThrow('Invalid email format');
    });

    it('should throw error for email without local part', () => {
      expect(() => new Email('@example.com')).toThrow('Invalid email format');
    });

    it('should throw error for email with spaces', () => {
      expect(() => new Email('user @example.com')).toThrow('Invalid email format');
    });
  });
});
