import type { Range } from "../types/Range";

/**
 * Sorts an array of ranges in ascending order based on their start and end
 * positions.
 *
 * @param ranges The array of ranges to sort
 * @returns The sorted array of ranges
 */
export function sortRanges(ranges: Range[]) {
  return ranges.sort((a, b) => {
    if (a.start.isBefore(b.start)) {
      return -1;
    }
    if (a.start.isAfter(b.start)) {
      return 1;
    }
    if (a.end.isBefore(b.end)) {
      return -1;
    }
    if (a.end.isAfter(b.end)) {
      return 1;
    }
    return 0;
  });
}
