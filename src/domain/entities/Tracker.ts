import { TrackerId } from '../valueObjects/TrackerId';
import { UserId } from '../valueObjects/UserId';
import { TrackerName } from '../valueObjects/TrackerName';
import { TrackerType } from '../valueObjects/TrackerType';

export class Tracker {
  public readonly id: TrackerId;
  public readonly userId: UserId;
  public readonly name: TrackerName;
  public readonly type: TrackerType;
  public readonly description: string | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(
    id: TrackerId,
    userId: UserId,
    name: TrackerName,
    type: TrackerType,
    description: string | null = null,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.type = type;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  equals(other: Tracker): boolean {
    return this.id.equals(other.id);
  }
}
