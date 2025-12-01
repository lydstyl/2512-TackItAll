/**
 * DTO for requesting tracker statistics
 */
export interface GetTrackerStatsDTO {
  trackerId: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Statistics for boolean trackers
 */
export interface BooleanStatsDTO {
  type: 'BOOLEAN';
  totalEntries: number;
  trueCount: number;
  falseCount: number;
  truePercentage: number;
  falsePercentage: number;
}

/**
 * Statistics for number trackers
 */
export interface NumberStatsDTO {
  type: 'NUMBER';
  totalEntries: number;
  sum: number;
  average: number;
  min: number;
  max: number;
}

/**
 * Statistics for text trackers
 */
export interface TextStatsDTO {
  type: 'TEXT';
  totalEntries: number;
}

/**
 * Statistics for duration trackers
 */
export interface DurationStatsDTO {
  type: 'DURATION';
  totalEntries: number;
  totalMinutes: number;
  averageMinutes: number;
  totalDisplay: string; // HH:MM format
  averageDisplay: string; // HH:MM format
}

/**
 * Statistics for currency trackers
 */
export interface CurrencyStatsDTO {
  type: 'CURRENCY';
  totalEntries: number;
  totalCents: number;
  averageCents: number;
  totalDisplay: string; // €XX.XX format
  averageDisplay: string; // €XX.XX format
}

/**
 * Union type for all statistics
 */
export type TrackerStatsDTO =
  | BooleanStatsDTO
  | NumberStatsDTO
  | TextStatsDTO
  | DurationStatsDTO
  | CurrencyStatsDTO;
