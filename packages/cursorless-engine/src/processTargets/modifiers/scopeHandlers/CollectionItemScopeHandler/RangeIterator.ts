import type { Range } from "@cursorless/common";

export class RangeIterator<T extends Range> {
  private index = 0;

  constructor(public ranges: T[]) {}

  contains(separator: Range): boolean {
    return this.advance(separator);
  }

  getContaining(separator: Range): T | undefined {
    if (!this.advance(separator)) {
      return undefined;
    }

    return this.ranges[this.index];
  }

  private advance(separator: Range): boolean {
    while (this.index < this.ranges.length) {
      const range = this.ranges[this.index];

      if (range.contains(separator)) {
        return true;
      }

      // Separator is before the range. Since the ranges are sorted, we can stop here.
      if (separator.end.isBefore(range.start)) {
        return false;
      }

      this.index++;
    }

    return false;
  }
}
