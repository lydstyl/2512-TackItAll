import { TrackerType } from '../../domain/valueObjects/TrackerType';

/**
 * DTO for creating a tracker
 */
export interface CreateTrackerDTO {
  userId: string;
  name: string;
  type: TrackerType;
  description?: string;
}

/**
 * DTO for updating a tracker
 */
export interface UpdateTrackerDTO {
  trackerId: string;
  name?: string;
  description?: string;
}

/**
 * DTO for tracker result
 */
export interface TrackerDTO {
  id: string;
  userId: string;
  name: string;
  type: TrackerType;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}
