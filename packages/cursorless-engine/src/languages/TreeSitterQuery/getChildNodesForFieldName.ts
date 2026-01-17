import type { Node } from "web-tree-sitter";

export function getChildNodesForFieldName(
  node: Node,
  fieldName: string,
): Node[] {
  const nodes = [];
  const treeCursor = node.walk();
  let hasNext = treeCursor.gotoFirstChild();

  while (hasNext) {
    if (treeCursor.currentFieldName === fieldName) {
      nodes.push(treeCursor.currentNode);
    }
    hasNext = treeCursor.gotoNextSibling();
  }

  return nodes;
}
