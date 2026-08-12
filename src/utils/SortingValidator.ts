/**
 * Pure utility class for validating if arrays of data are correctly sorted.
 * Decoupled from Playwright or DOM elements to satisfy strict architecture layers.
 */
export class SortingValidator {
  
  /**
   * Validates that an array of strings is sorted alphabetically (A-Z).
   * Note: This uses localeCompare for robust sorting validation.
   * @param items Array of strings (e.g. titles)
   * @returns boolean indicating if the array is perfectly sorted
   */
  static isAlphabetical(items: string[]): boolean {
    if (!items || items.length <= 1) return true;

    for (let i = 0; i < items.length - 1; i++) {
      // Knimbus gives special characters preference over alphabets, 
      // so we use standard string comparison (< and >) on lowercased strings
      // rather than localeCompare which often ignores punctuation.
      const current = items[i].toLowerCase().trim();
      const next = items[i+1].toLowerCase().trim();
      
      if (current > next) {
        return false;
      }
    }
    return true;
  }

  /**
   * Validates that an array of numbers is sorted descending (Newest first).
   * @param dates Array of numbers (e.g. years)
   * @returns boolean indicating if the array is perfectly sorted descending
   */
  static isDescendingDate(dates: number[]): boolean {
    if (!dates || dates.length <= 1) return true;

    for (let i = 0; i < dates.length - 1; i++) {
      // If the current date is smaller than the next date, it's not descending
      if (dates[i] < dates[i + 1]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Helper function to compute expected array for debugging output.
   */
  static getExpectedAlphabeticalOrder(items: string[]): string[] {
    return [...items].sort((a, b) => {
      const current = a.toLowerCase().trim();
      const next = b.toLowerCase().trim();
      if (current > next) return 1;
      if (current < next) return -1;
      return 0;
    });
  }

  static getExpectedDescendingDateOrder(dates: number[]): number[] {
    return [...dates].sort((a, b) => b - a);
  }
}
