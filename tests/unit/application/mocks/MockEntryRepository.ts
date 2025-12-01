import { IEntryRepository } from '../../../../src/domain/repositories/IEntryRepository';
import { Entry } from '../../../../src/domain/entities/Entry';
import { EntryId } from '../../../../src/domain/valueObjects/EntryId';
import { TrackerId } from '../../../../src/domain/valueObjects/TrackerId';

/**
 * Mock implementation of IEntryRepository for testing
 * Stores entries in memory
 */
export class MockEntryRepository implements IEntryRepository {
  public entries: Entry[] = [];

  async save(entry: Entry): Promise<void> {
    // Check if entry already exists
    const existingIndex = this.entries.findIndex((e) => e.id.equals(entry.id));

    if (existingIndex >= 0) {
      // Update existing entry
      this.entries[existingIndex] = entry;
    } else {
      // Add new entry
      this.entries.push(entry);
    }
  }

  async findById(id: EntryId): Promise<Entry | null> {
    const entry = this.entries.find((e) => e.id.equals(id));
    return entry || null;
  }

  async findByTrackerId(trackerId: TrackerId): Promise<Entry[]> {
    return this.entries.filter((e) => e.trackerId.equals(trackerId));
  }

  async findByTrackerIdAndDateRange(
    trackerId: TrackerId,
    startDate: Date,
    endDate: Date
  ): Promise<Entry[]> {
    return this.entries.filter(
      (e) =>
        e.trackerId.equals(trackerId) &&
        e.recordedAt >= startDate &&
        e.recordedAt <= endDate
    );
  }

  async delete(id: EntryId): Promise<void> {
    this.entries = this.entries.filter((e) => !e.id.equals(id));
  }

  async exists(id: EntryId): Promise<boolean> {
    return this.entries.some((e) => e.id.equals(id));
  }

  async countByTrackerId(trackerId: TrackerId): Promise<number> {
    return this.entries.filter((e) => e.trackerId.equals(trackerId)).length;
  }

  // Helper methods for testing
  clear(): void {
    this.entries = [];
  }

  count(): number {
    return this.entries.length;
  }
}
