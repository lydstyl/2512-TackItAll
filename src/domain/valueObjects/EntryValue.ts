import { TrackerType } from './TrackerType';

/**
 * Abstract base class for polymorphic entry values
 */
export abstract class EntryValue {
  abstract getType(): TrackerType;
  abstract getRawValue(): any;
  abstract getDisplayValue(): string;
}

/**
 * Boolean entry value (true/false)
 */
export class BooleanValue extends EntryValue {
  constructor(private readonly value: boolean) {
    super();
  }

  getType(): TrackerType {
    return TrackerType.BOOLEAN;
  }

  getRawValue(): boolean {
    return this.value;
  }

  getDisplayValue(): string {
    return this.value ? 'Yes' : 'No';
  }
}

/**
 * Number entry value (integer or decimal)
 */
export class NumberValue extends EntryValue {
  constructor(
    private readonly value: number,
    private readonly decimals: number = 0
  ) {
    super();
  }

  getType(): TrackerType {
    return TrackerType.NUMBER;
  }

  getRawValue(): number {
    return this.value;
  }

  getDisplayValue(): string {
    if (this.decimals === 0) {
      return this.value.toString();
    }
    return this.value.toFixed(this.decimals);
  }
}

/**
 * Text entry value (free text)
 */
export class TextValue extends EntryValue {
  constructor(private readonly value: string) {
    super();
  }

  getType(): TrackerType {
    return TrackerType.TEXT;
  }

  getRawValue(): string {
    return this.value;
  }

  getDisplayValue(): string {
    return this.value;
  }
}

/**
 * Duration entry value (stored as minutes, displayed as HH:MM)
 */
export class DurationValue extends EntryValue {
  constructor(private readonly totalMinutes: number) {
    super();
  }

  /**
   * Create DurationValue from HH:MM format string
   */
  static fromHHMM(hhMM: string): DurationValue {
    const [hoursStr, minutesStr] = hhMM.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    return new DurationValue(hours * 60 + minutes);
  }

  getType(): TrackerType {
    return TrackerType.DURATION;
  }

  getRawValue(): number {
    return this.totalMinutes;
  }

  getDisplayValue(): string {
    const hours = Math.floor(this.totalMinutes / 60);
    const minutes = this.totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}

/**
 * Currency entry value (EUR only, stored as cents, displayed as €XX.XX)
 */
export class CurrencyValue extends EntryValue {
  constructor(private readonly cents: number) {
    super();
  }

  /**
   * Create CurrencyValue from euros (decimal)
   */
  static fromEuros(euros: number): CurrencyValue {
    return new CurrencyValue(Math.round(euros * 100));
  }

  getType(): TrackerType {
    return TrackerType.CURRENCY;
  }

  getRawValue(): number {
    return this.cents;
  }

  getDisplayValue(): string {
    return `€${(this.cents / 100).toFixed(2)}`;
  }

  /**
   * Get value in euros (decimal)
   */
  getEuros(): number {
    return this.cents / 100;
  }
}
