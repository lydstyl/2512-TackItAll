export class TrackerName {
  public readonly value: string;

  constructor(value: string) {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      throw new Error('Tracker name cannot be empty');
    }

    if (trimmed.length > 100) {
      throw new Error('Tracker name cannot exceed 100 characters');
    }

    this.value = trimmed;
  }

  equals(other: TrackerName): boolean {
    return this.value === other.value;
  }
}
