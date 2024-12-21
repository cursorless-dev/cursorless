import type { Range } from "@cursorless/common";
import { RangeNode } from "./RangeNode";

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
      parents.push(node);
      results.push(node);
    }
  }

  return results;
}
