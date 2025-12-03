/**
 * Shared utility functions for form handling and data parsing.
 * Consolidates duplicated utilities from quote, invoice, and scheduling components.
 */

/**
 * Generates a unique client-side ID using crypto.randomUUID when available,
 * falling back to a random string for older browsers.
 *
 * @param prefix - Optional prefix for the ID (e.g., "co-" for change orders)
 */
export const createClientId = (prefix?: string): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  const randomPart = Math.random().toString(36).slice(2, 11);
  return prefix ? `${prefix}${randomPart}` : `temp-${randomPart}`;
};

/**
 * Parses a unit price from string or number input.
 * Returns 0 for invalid or non-finite values.
 */
export const parseUnitPrice = (raw: string | number): number => {
  if (typeof raw === "number") {
    return Number.isFinite(raw) ? raw : 0;
  }
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Pads a number to 2 digits with a leading zero.
 */
export const pad = (value: number): string => value.toString().padStart(2, "0");

/**
 * Formats hours and minutes into a 12-hour time label (e.g., "9:30 AM").
 */
export const formatTimeLabel = (hours: number, minutes: number): string => {
  const period = hours >= 12 ? "PM" : "AM";
  const normalizedHours = ((hours + 11) % 12) + 1;
  return `${normalizedHours}:${pad(minutes)} ${period}`;
};

/**
 * Generates an array of time options for scheduling dropdowns.
 *
 * @param intervalMinutes - Minutes between each option (default: 15)
 * @returns Array of { value, label } objects for time selection
 */
export const generateTimeOptions = (
  intervalMinutes: number = 15
): Array<{ value: string; label: string }> => {
  const items: Array<{ value: string; label: string }> = [];

  for (let i = 0; i < 24 * 60; i += intervalMinutes) {
    const hours = Math.floor(i / 60);
    const minutes = i % 60;
    const value = `${pad(hours)}:${pad(minutes)}`;
    items.push({ value, label: formatTimeLabel(hours, minutes) });
  }

  return items;
};
