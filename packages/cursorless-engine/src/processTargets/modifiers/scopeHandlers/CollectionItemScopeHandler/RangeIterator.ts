import type { Range } from "@cursorless/common";

export class RangeIterator {
  private index = 0;

  constructor(public ranges: Range[]) {}

  contains(separator: Range): boolean {
    while (this.index < this.ranges.length) {
      const range = this.ranges[this.index];

      if (range.contains(separator)) {
        return true;
      }

      // Separator is after the range. Since the ranges are sorted, we can stop here.
      if (separator.start.isAfter(range.end)) {
        return false;
      }

      this.index++;
    }

    return false;
  }

  getsSmallestContaining(separator: Range): Range | undefined {
    //   TODO: fixed performance on large files
    return this.ranges
      .filter((range) => range.contains(separator))
      .sort((a, b) => (a.contains(b) ? 1 : b.contains(a) ? -1 : 0))[0];
  }
}

// const containingInteriorRange: Range | undefined = interiorRanges
//         .filter((range) => range.contains(separator))
//         .sort((a, b) => (a.contains(b) ? 1 : b.contains(a) ? -1 : 0))[0];
