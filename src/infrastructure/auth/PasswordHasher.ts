import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export class PasswordHasher {
  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  static async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
