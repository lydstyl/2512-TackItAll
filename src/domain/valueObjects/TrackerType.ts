/**
 * Types of trackers available in the system
 */
export enum TrackerType {
  BOOLEAN = 'BOOLEAN',   // true/false (e.g., "Did I exercise?")
  NUMBER = 'NUMBER',     // decimal number (e.g., weight, distance)
  TEXT = 'TEXT',         // free text (e.g., notes, mood description)
  DURATION = 'DURATION', // HH:MM format, stored as minutes
  CURRENCY = 'CURRENCY', // EUR only, stored as cents
}
