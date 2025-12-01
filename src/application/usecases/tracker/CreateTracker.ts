import { ITrackerRepository } from '../../../domain/repositories/ITrackerRepository';
import { Tracker } from '../../../domain/entities/Tracker';
import { TrackerId } from '../../../domain/valueObjects/TrackerId';
import { UserId } from '../../../domain/valueObjects/UserId';
import { TrackerName } from '../../../domain/valueObjects/TrackerName';
import { CreateTrackerDTO, TrackerDTO } from '../../dto/TrackerDTO';
import { randomBytes } from 'crypto';

/**
 * Result of CreateTracker use case
 */
export interface CreateTrackerResult {
  success: boolean;
  tracker: TrackerDTO;
}

/**
 * Use case: Create a new tracker
 */
export class CreateTracker {
  constructor(private readonly trackerRepository: ITrackerRepository) {}

  async execute(dto: CreateTrackerDTO): Promise<CreateTrackerResult> {
    // 1. Validate and create value objects
    const userId = new UserId(dto.userId);
    const name = new TrackerName(dto.name);
    const trackerId = new TrackerId(this.generateId());

    // 2. Create tracker entity
    const now = new Date();
    const tracker = new Tracker(
      trackerId,
      userId,
      name,
      dto.type,
      dto.description || null,
      now,
      now
    );

    // 3. Save to repository
    await this.trackerRepository.save(tracker);

    // 4. Return result DTO
    return {
      success: true,
      tracker: {
        id: tracker.id.value,
        userId: tracker.userId.value,
        name: tracker.name.value,
        type: tracker.type,
        description: tracker.description,
        createdAt: tracker.createdAt,
        updatedAt: tracker.updatedAt,
      },
    };
  }

  /**
   * Generate unique ID for tracker
   * Uses crypto.randomBytes for uniqueness
   */
  private generateId(): string {
    return `tracker_${randomBytes(16).toString('hex')}`;
  }
}
