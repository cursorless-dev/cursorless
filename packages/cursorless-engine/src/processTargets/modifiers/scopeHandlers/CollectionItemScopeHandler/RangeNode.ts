import { Range } from "@cursorless/common";

export class RangeNode extends Range {
  children: RangeNode[] = [];

  constructor(private range: Range) {
    super(range.start, range.end);
  }

  getSmallLestContaining(separator: Range): Range {
    for (const child of this.children) {
      if (child.contains(separator)) {
        return child.getSmallLestContaining(separator);
      }
    }

    return this.range;
  }
}
