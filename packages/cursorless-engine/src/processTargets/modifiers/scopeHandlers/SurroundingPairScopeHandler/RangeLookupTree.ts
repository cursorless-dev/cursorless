import type { Range } from "@cursorless/common";
import { RangeLookupList } from "./RangeLookupList";

/**
 * A tree of ranges that allows for efficient lookup of ranges that contain a search item.
 * The items must be sorted in document order.
 */
export class RangeLookupTree<T extends { range: Range }> {
  private children: RangeLookupList<RangeLookupTreeNode<T>>;

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
): RangeLookupList<RangeLookupTreeNode<T>> {
  const results: RangeLookupTreeNode<T>[] = [];
  const parents: RangeLookupTreeNode<T>[] = [];

  for (const item of items) {
    const node = new RangeLookupTreeNode(item);

    while (
      parents.length > 0 &&
      !parents[parents.length - 1].range.contains(item.range)
    ) {
      parents.pop();
    }

    const parent = parents[parents.length - 1];

    if (parent != null) {
      parent.children.add(node);
    } else {
      results.push(node);
    }

    parents.push(node);
  }

  return new RangeLookupList(results);
}

class RangeLookupTreeNode<T extends { range: Range }> {
  public children: RangeLookupList<RangeLookupTreeNode<T>>;

  constructor(private item: T) {
    this.children = new RangeLookupList([]);
  }

  get range(): Range {
    return this.item.range;
  }

  getSmallLestContaining(range: Range): T {
    const child = this.children
      .getContaining(range)
      ?.getSmallLestContaining(range);

    return child ?? this.item;
  }
}
