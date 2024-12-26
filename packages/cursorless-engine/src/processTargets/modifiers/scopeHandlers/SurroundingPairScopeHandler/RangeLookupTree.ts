import type { Range } from "@cursorless/common";
import { RangeTreeNode } from "./RangeTreeNode";
import { RangeLookupList } from "./RangeLookupList";

/**
 * A tree of ranges that allows for efficient lookup of ranges that contain a search item.
 * The items must be sorted in document order.
 */
export class RangeLookupTree<T extends { range: Range }> {
  private children: RangeLookupList<RangeTreeNode<T>>;

  /**
   * @param items The items to search in. Must be sorted in document order.
   */
  constructor(items: T[]) {
    this.children = createNodes(items);
  }

  getSmallLestContaining(separator: Range): T | undefined {
    return this.children
      .getContaining(separator)
      ?.getSmallLestContaining(separator);
  }
}

function createNodes<T extends { range: Range }>(
  items: T[],
): RangeLookupList<RangeTreeNode<T>> {
  const results: RangeTreeNode<T>[] = [];
  const parents: RangeTreeNode<T>[] = [];

  for (const item of items) {
    const node = new RangeTreeNode(item);

    while (
      parents.length > 0 &&
      !parents[parents.length - 1].range.contains(item.range)
    ) {
      parents.pop();
    }

    const parent = parents[parents.length - 1];

    if (parent != null) {
      parent.children.items.push(node);
    } else {
      results.push(node);
    }

    parents.push(node);
  }

  return new RangeLookupList(results);
}
