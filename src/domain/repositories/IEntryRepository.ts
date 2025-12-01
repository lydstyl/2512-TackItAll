import { Entry } from '../entities/Entry';
import { EntryId } from '../valueObjects/EntryId';
import { TrackerId } from '../valueObjects/TrackerId';

/**
 * Repository interface for Entry entity
 * Implemented by infrastructure layer (e.g., PrismaEntryRepository)
 */
export interface IEntryRepository {
  /**
   * Save an entry (create or update)
   */
  save(entry: Entry): Promise<void>;

  /**
   * Find an entry by its ID
   */
  findById(id: EntryId): Promise<Entry | null>;

  /**
   * Find all entries for a tracker
   */
  findByTrackerId(trackerId: TrackerId): Promise<Entry[]>;

  /**
   * Find entries for a tracker within a date range
   */
  findByTrackerIdAndDateRange(
    trackerId: TrackerId,
    startDate: Date,
    endDate: Date
  ): Promise<Entry[]>;

  /**
   * Delete an entry by its ID
   */
  delete(id: EntryId): Promise<void>;

  /**
   * Check if an entry exists
   */
  exists(id: EntryId): Promise<boolean>;

  /**
   * Count entries for a tracker
   */
  countByTrackerId(trackerId: TrackerId): Promise<number>;
}
