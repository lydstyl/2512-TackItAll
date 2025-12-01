import { render } from '@testing-library/react';
import type { ReactElement } from 'react';

/**
 * Custom render function for testing React components
 */
export function renderComponent(ui: ReactElement) {
  return render(ui);
}

/**
 * Generate a random ID for testing
 */
export function generateTestId(): string {
  return `test-${Math.random().toString(36).substring(7)}`;
}

/**
 * Create a test date
 */
export function createTestDate(daysOffset: number = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date;
}
