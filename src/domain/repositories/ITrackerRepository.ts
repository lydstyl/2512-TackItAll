import { Tracker } from '../entities/Tracker';
import { TrackerId } from '../valueObjects/TrackerId';
import { UserId } from '../valueObjects/UserId';

/**
 * Repository interface for Tracker entity
 * Implemented by infrastructure layer (e.g., PrismaTrackerRepository)
 */
export interface ITrackerRepository {
  /**
   * Save a tracker (create or update)
   */
  save(tracker: Tracker): Promise<void>;

  /**
   * Find a tracker by its ID
   */
  findById(id: TrackerId): Promise<Tracker | null>;

  /**
   * Find all trackers for a user
   */
  findByUserId(userId: UserId): Promise<Tracker[]>;

  /**
   * Delete a tracker by its ID
   */
  delete(id: TrackerId): Promise<void>;

  /**
   * Check if a tracker exists
   */
  exists(id: TrackerId): Promise<boolean>;
}
