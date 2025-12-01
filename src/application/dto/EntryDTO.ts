/**
 * DTO for entry value based on tracker type
 */
export type EntryValueDTO =
  | { type: 'BOOLEAN'; value: boolean }
  | { type: 'NUMBER'; value: number; decimals?: number }
  | { type: 'TEXT'; value: string }
  | { type: 'DURATION'; value: string } // HH:MM format
  | { type: 'CURRENCY'; value: number }; // in euros (will be converted to cents)

/**
 * DTO for creating an entry
 */
export interface AddEntryDTO {
  trackerId: string;
  value: EntryValueDTO;
  recordedAt: Date;
  note?: string;
}

/**
 * DTO for updating an entry
 */
export interface UpdateEntryDTO {
  entryId: string;
  value?: EntryValueDTO;
  recordedAt?: Date;
  note?: string;
}

/**
 * DTO for entry result
 */
export interface EntryDTO {
  id: string;
  trackerId: string;
  value: {
    type: string;
    rawValue: any;
    displayValue: string;
  };
  recordedAt: Date;
  note: string | null;
  createdAt: Date;
}
