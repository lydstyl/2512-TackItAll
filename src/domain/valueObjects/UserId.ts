export class UserId {
  public readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('UserId cannot be empty');
    }
    this.value = value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}
