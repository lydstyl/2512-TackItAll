import { UserId } from '../valueObjects/UserId';
import { Email } from '../valueObjects/Email';

export class User {
  public readonly id: UserId;
  public readonly email: Email;
  public readonly name: string;
  public readonly createdAt: Date;

  constructor(
    id: UserId,
    email: Email,
    name: string,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.createdAt = createdAt;
  }

  equals(other: User): boolean {
    return this.id.equals(other.id);
  }
}
