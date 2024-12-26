import type { Range } from "@cursorless/common";

/**
 * An iterator that allows for efficient lookup of ranges that contain a search item.
 * The items must be sorted in document order.
 */
export class RangeLookupList<T extends { range: Range }> {
  private index = 0;

  /**
   * @param items The items to iterate over. Must be sorted in document order.
   */
  constructor(public items: T[]) {}

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
