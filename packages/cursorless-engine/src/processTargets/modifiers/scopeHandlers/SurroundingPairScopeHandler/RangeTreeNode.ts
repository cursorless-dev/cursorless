import type { Range } from "@cursorless/common";
import { RangeLookupList } from "./RangeLookupList";

export class RangeTreeNode<T extends { range: Range }> {
  children: RangeLookupList<RangeTreeNode<T>>;

  constructor(private item: T) {
    this.children = new RangeLookupList([]);
  }

  get range(): Range {
    return this.item.range;
  }

  getSmallLestContaining(range: Range): T {
    const child = this.children.getContaining(range);

    if (child != null) {
      return child.getSmallLestContaining(range);
    }

    return this.item;
  }
}
