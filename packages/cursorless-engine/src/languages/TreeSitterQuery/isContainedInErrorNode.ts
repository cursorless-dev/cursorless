import type { SyntaxNode } from "web-tree-sitter";

/**
 * Determines whether the given node or one of its ancestors is an error node
 * @param node The node to check
 * @returns True if the given node is contained in an error node
 */
export function isContainedInErrorNode(node: SyntaxNode) {
  if (node.hasError) {
    return true;
  }

  let currentNode: SyntaxNode | null = node.parent;

  while (currentNode != null) {
    // Ancestral node has errors, but it was not siblings to the previous node
    // that caused the problem. We don't want to discard a node when a sibling
    // that isn't adjacent is erroring.
    if (currentNode.hasError) {
      return false;
    }
    // A adjacent sibling node was causing the problem. ie we are right next to the error node.
    if (
      currentNode.previousSibling?.isError ||
      currentNode.nextSibling?.isError
    ) {
      return true;
    }
    currentNode = currentNode.parent;
  }

  return false;
}
