import { describe, it, expect } from 'vitest';
import { User } from '../../../../src/domain/entities/User';
import { UserId } from '../../../../src/domain/valueObjects/UserId';
import { Email } from '../../../../src/domain/valueObjects/Email';

describe('User Entity', () => {
  describe('Creation', () => {
    it('should create a user with valid data', () => {
      const id = new UserId('user-123');
      const email = new Email('john@example.com');
      const name = 'John Doe';
      const createdAt = new Date('2024-01-01');

      const user = new User(id, email, name, createdAt);

      expect(user.id).toBe(id);
      expect(user.email).toBe(email);
      expect(user.name).toBe(name);
      expect(user.createdAt).toBe(createdAt);
    });

    it('should create user with current date if not provided', () => {
      const id = new UserId('user-123');
      const email = new Email('john@example.com');
      const name = 'John Doe';

      const before = new Date();
      const user = new User(id, email, name);
      const after = new Date();

      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('Properties', () => {
    it('should have readonly properties', () => {
      const user = new User(
        new UserId('user-123'),
        new Email('john@example.com'),
        'John Doe'
      );

      // TypeScript enforces readonly at compile time
      // This test documents the expected behavior
      expect(user.id).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.name).toBeDefined();
      expect(user.createdAt).toBeDefined();
    });

    it('should expose email value', () => {
      const email = new Email('john@example.com');
      const user = new User(
        new UserId('user-123'),
        email,
        'John Doe'
      );

      expect(user.email.value).toBe('john@example.com');
    });

    it('should expose user id value', () => {
      const userId = new UserId('user-123');
      const user = new User(
        userId,
        new Email('john@example.com'),
        'John Doe'
      );

      expect(user.id.value).toBe('user-123');
    });
  });

  describe('Equality', () => {
    it('should be equal when ids are equal', () => {
      const id = new UserId('user-123');
      const user1 = new User(id, new Email('john@example.com'), 'John Doe');
      const user2 = new User(id, new Email('jane@example.com'), 'Jane Doe');

      expect(user1.equals(user2)).toBe(true);
    });

    it('should not be equal when ids are different', () => {
      const user1 = new User(
        new UserId('user-123'),
        new Email('john@example.com'),
        'John Doe'
      );
      const user2 = new User(
        new UserId('user-456'),
        new Email('john@example.com'),
        'John Doe'
      );

      expect(user1.equals(user2)).toBe(false);
    });
  });
});
