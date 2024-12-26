import type { Range } from "@cursorless/common";
import { RangeNode } from "./RangeNode";

/**
 * Creates a tree of ranges from a list of ranges. This improves containing lookup time.
 * @param items The ranges to create a tree from.
 * @returns The root nodes of the tree.
 */
export function createRangeTree<T extends { range: Range }>(
  items: T[],
): RangeNode<T>[] {
  const results: RangeNode<T>[] = [];
  const parents: RangeNode<T>[] = [];

  for (const item of items) {
    const node = new RangeNode(item);

    while (
      parents.length > 0 &&
      !parents[parents.length - 1].range.contains(item.range)
    ) {
      parents.pop();
    }

    const parent = parents[parents.length - 1];

    if (parent != null) {
      parent.children.push(node);
    } else {
      results.push(node);
    }

    parents.push(node);
  }

  return results;
}
