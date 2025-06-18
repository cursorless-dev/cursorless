import type { SimpleSyntaxNode } from "./QueryCapture";

export function getChildNodesForFieldName(
  node: SimpleSyntaxNode,
  fieldName: string,
): SimpleSyntaxNode[] {
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
