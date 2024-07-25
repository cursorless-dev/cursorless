import type { SyntaxNode } from "web-tree-sitter";

/**
 * Determines whether the given node or one of its ancestors is an error node
 * @param node The node to check
 * @returns True if the given node is contained in an error node
 */
export function isContainedInErrorNode(node: SyntaxNode) {
  let currentNode: SyntaxNode | null = node.parent;

  while (currentNode != null) {
    if (currentNode.hasError || currentNode.isError) {
      return true;
    }
    currentNode = currentNode.parent;
  }

  return false;
}
