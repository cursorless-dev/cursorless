import type { Range } from "@cursorless/common";

/**
 * An iterator that allows for efficient lookup of ranges that contain a search item.
 */
export class RangeIterator<T extends { range: Range }> {
  private index = 0;

  constructor(
    public items: T[],
    sortItems = false,
  ) {
    if (sortItems) {
      this.items.sort((a, b) => a.range.start.compareTo(b.range.start));
    }
  }

  contains(searchItem: Range): boolean {
    return this.advance(searchItem);
  }

  getContaining(searchItem: Range): T | undefined {
    if (!this.advance(searchItem)) {
      return undefined;
    }

    return this.items[this.index];
  }

  private advance(searchItem: Range): boolean {
    while (this.index < this.items.length) {
      const range = this.items[this.index].range;

      if (range.contains(searchItem)) {
        return true;
      }

      // Search item is before the range. Since the ranges are sorted, we can stop here.
      if (searchItem.end.isBefore(range.start)) {
        return false;
      }

      this.index++;
    }

    return false;
  }
}
