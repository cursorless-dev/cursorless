import { Range } from "@cursorless/common";
import type { Node } from "web-tree-sitter";

export function getNodeRange(node: Node) {
  return new Range(
    node.startPosition.row,
    node.startPosition.column,
    node.endPosition.row,
    node.endPosition.column,
  );
}
