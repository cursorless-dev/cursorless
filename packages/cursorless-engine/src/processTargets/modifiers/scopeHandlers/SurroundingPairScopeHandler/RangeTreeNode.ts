import type { Range } from "@cursorless/common";
import { RangeLookupList } from "./RangeLookupList";

export class RangeTreeNode<T extends { range: Range }> {
  private children: RangeLookupList<RangeTreeNode<T>>;

  constructor(private item: T) {
    this.children = new RangeLookupList([]);
  }

  get range(): Range {
    return this.item.range;
  }

  addChildNode(node: RangeTreeNode<T>) {
    this.children.add(node);
  }

  getSmallLestContaining(range: Range): T {
    const child = this.children
      .getContaining(range)
      ?.getSmallLestContaining(range);

    return child ?? this.item;
  }
}
