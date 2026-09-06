import type { Node } from "web-tree-sitter";
import { Range } from "@cursorless/lib-common";

export function getNodeRange(node: Node) {
  return new Range(
    node.startPosition.row,
    node.startPosition.column,
    node.endPosition.row,
    node.endPosition.column,
  );
}

export function getNodeStartRange(node: Node) {
  return new Range(
    node.startPosition.row,
    node.startPosition.column,
    node.startPosition.row,
    node.startPosition.column,
  );
}

export function getNodeEndRange(node: Node) {
  return new Range(
    node.endPosition.row,
    node.endPosition.column,
    node.endPosition.row,
    node.endPosition.column,
  );
}
