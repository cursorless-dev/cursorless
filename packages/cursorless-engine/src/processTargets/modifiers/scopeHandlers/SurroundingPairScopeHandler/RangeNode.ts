import type { Range } from "@cursorless/common";

export class RangeNode<T extends { range: Range }> {
  children: RangeNode<T>[] = [];

  constructor(private item: T) {}

  get range(): Range {
    return this.item.range;
  }

  getSmallLestContaining(separator: Range): T {
    for (const child of this.children) {
      if (child.item.range.contains(separator)) {
        return child.getSmallLestContaining(separator);
      }
    }

    return this.item;
  }
}
