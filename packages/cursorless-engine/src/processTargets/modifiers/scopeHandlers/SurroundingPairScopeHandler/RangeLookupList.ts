import type { Range } from "@cursorless/common";

/**
 * Given a list of ranges (the haystack), allows the client to search for a sequence of ranges (the needles).
 * Has the following requirements:
 * - the haystack must be sorted in document order
 * - **the needles must be in document order as well**. This enables us to avoid backtracking as you search for a sequence of items.
 * - the haystack entries must not overlap. Adjacent is fine
 */
export class OneWayRangeFinder<T extends { range: Range }> {
  private index = 0;

  /**
   * @param items The items to search in. Must be sorted in document order.
   */
  constructor(private items: T[]) {}

  add(item: T) {
    this.items.push(item);
  }

  contains(searchItem: Range): boolean {
    return this.advance(searchItem);
  }

  getContaining(searchItem: Range): T | undefined {
    if (this.advance(searchItem)) {
      return this.items[this.index];
    }

    return undefined;
  }

  private advance(searchItem: Range): boolean {
    while (this.index < this.items.length) {
      const range = this.items[this.index].range;

      if (range.contains(searchItem)) {
        return true;
      }

      // Search item is before the range. Since the ranges are sorted, we can stop here.
      if (searchItem.end.isBeforeOrEqual(range.start)) {
        return false;
      }

      this.index++;
    }

    return false;
  }
}
