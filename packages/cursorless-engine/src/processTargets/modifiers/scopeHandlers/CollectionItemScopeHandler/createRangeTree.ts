import type { Range } from "@cursorless/common";
import { RangeNode } from "./RangeNode";

/**
 * Creates a tree of ranges from a list of ranges. This improves containing lookup time.
 * @param ranges The ranges to create a tree from.
 * @returns The root nodes of the tree.
 */
export function createRangeTree(ranges: Range[]): RangeNode[] {
  const results: RangeNode[] = [];
  const parents: RangeNode[] = [];

  for (const range of ranges) {
    const node = new RangeNode(range);

    while (parents.length > 0 && !parents[parents.length - 1].contains(range)) {
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
