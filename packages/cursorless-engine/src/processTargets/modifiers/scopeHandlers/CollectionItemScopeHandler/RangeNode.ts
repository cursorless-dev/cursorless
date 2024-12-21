import { Range } from "@cursorless/common";

export class RangeNode extends Range {
  children: RangeNode[] = [];

  constructor(private range: Range) {
    super(range.start, range.end);
  }

  getSmallLestContaining(separator: Range): Range {
    let result = this.range;

    for (const child of this.children) {
      if (child.contains(separator)) {
        result = child.getSmallLestContaining(separator);
        break;
      }
    }

    return result;
  }
}
