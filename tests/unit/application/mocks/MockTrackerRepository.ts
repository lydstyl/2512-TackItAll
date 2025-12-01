import { ITrackerRepository } from '../../../../src/domain/repositories/ITrackerRepository';
import { Tracker } from '../../../../src/domain/entities/Tracker';
import { TrackerId } from '../../../../src/domain/valueObjects/TrackerId';
import { UserId } from '../../../../src/domain/valueObjects/UserId';

/**
 * Mock implementation of ITrackerRepository for testing
 * Stores trackers in memory
 */
export class MockTrackerRepository implements ITrackerRepository {
  public trackers: Tracker[] = [];

  async save(tracker: Tracker): Promise<void> {
    // Check if tracker already exists
    const existingIndex = this.trackers.findIndex((t) =>
      t.id.equals(tracker.id)
    );

    if (existingIndex >= 0) {
      // Update existing tracker
      this.trackers[existingIndex] = tracker;
    } else {
      // Add new tracker
      this.trackers.push(tracker);
    }
  }

  async findById(id: TrackerId): Promise<Tracker | null> {
    const tracker = this.trackers.find((t) => t.id.equals(id));
    return tracker || null;
  }

  async findByUserId(userId: UserId): Promise<Tracker[]> {
    return this.trackers.filter((t) => t.userId.equals(userId));
  }

  async delete(id: TrackerId): Promise<void> {
    this.trackers = this.trackers.filter((t) => !t.id.equals(id));
  }

  async exists(id: TrackerId): Promise<boolean> {
    return this.trackers.some((t) => t.id.equals(id));
  }

  // Helper methods for testing
  clear(): void {
    this.trackers = [];
  }

  count(): number {
    return this.trackers.length;
  }
}
