export class EntryId {
  public readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('EntryId cannot be empty');
    }
    this.value = value;
  }

  equals(other: EntryId): boolean {
    return this.value === other.value;
  }
}
