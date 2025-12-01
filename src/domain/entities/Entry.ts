import { EntryId } from '../valueObjects/EntryId';
import { TrackerId } from '../valueObjects/TrackerId';
import { EntryValue } from '../valueObjects/EntryValue';

export class Entry {
  public readonly id: EntryId;
  public readonly trackerId: TrackerId;
  public readonly value: EntryValue;
  public readonly recordedAt: Date;
  public readonly note: string | null;
  public readonly createdAt: Date;

  constructor(
    id: EntryId,
    trackerId: TrackerId,
    value: EntryValue,
    recordedAt: Date,
    note: string | null = null,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.trackerId = trackerId;
    this.value = value;
    this.recordedAt = recordedAt;
    this.note = note;
    this.createdAt = createdAt;
  }

  equals(other: Entry): boolean {
    return this.id.equals(other.id);
  }
}
