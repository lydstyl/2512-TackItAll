export class TrackerId {
  public readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('TrackerId cannot be empty');
    }
    this.value = value;
  }

  equals(other: TrackerId): boolean {
    return this.value === other.value;
  }
}
