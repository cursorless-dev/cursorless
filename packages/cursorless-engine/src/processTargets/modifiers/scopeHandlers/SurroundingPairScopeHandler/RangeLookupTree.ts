import type { Range } from "@cursorless/common";
import { OneWayRangeFinder } from "./OneWayRangeFinder";

/**
 * Given a list of ranges (the haystack), allows the client to search for smallest range containing a range (the needle).
 * Has the following requirements:
 * - the haystack must be sorted in document order
 * - **the needles must be in document order as well**. This enables us to avoid backtracking as you search for a sequence of items.
 * - the haystack entries **may** be nested, but one haystack entry cannot partially contain another
 */
export class OneWayNestedRangeFinder<T extends { range: Range }> {
  private children: OneWayRangeFinder<RangeLookupTreeNode<T>>;

  /**
   * @param items The items to search in. Must be sorted in document order.
   */
  constructor(items: T[]) {
    this.children = createNodes(items);
  }

  getSmallestContaining(separator: Range): T | undefined {
    return this.children
      .getContaining(separator)
      ?.getSmallestContaining(separator);
  }
}

function createNodes<T extends { range: Range }>(
  items: T[],
): OneWayRangeFinder<RangeLookupTreeNode<T>> {
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

  return new OneWayRangeFinder(results);
}

class RangeLookupTreeNode<T extends { range: Range }> {
  public children: OneWayRangeFinder<RangeLookupTreeNode<T>>;

  constructor(private item: T) {
    this.children = new OneWayRangeFinder([]);
  }

  get range(): Range {
    return this.item.range;
  }

  getSmallestContaining(range: Range): T {
    const child = this.children
      .getContaining(range)
      ?.getSmallestContaining(range);

    return child ?? this.item;
  }
}
