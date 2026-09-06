import type { Node } from "web-tree-sitter";

/**
 * Determines whether the given node or one of its ancestors is an error node
 * @param node The node to check
 * @returns True if the given node is contained in an error node
 */
export function isContainedInErrorNode(node: Node) {
  // This node or one of it descendants is an error node
  if (node.hasError) {
    return true;
  }

  let ancestorNode: Node | null = node.parent;

  while (ancestorNode != null) {
    // Ancestral node is an error node
    if (ancestorNode.isError) {
      return true;
    }

    // Ancestral node has errors, but it was not siblings to the previous node.
    // We don't want to discard a node when a sibling that isn't adjacent is
    // erroring.
    if (ancestorNode.hasError) {
      return false;
    }

    // A adjacent sibling node was causing the problem. ie we are right next to the error node.
    if (
      ancestorNode.previousSibling?.isError ||
      ancestorNode.nextSibling?.isError
    ) {
      return true;
    }

    ancestorNode = ancestorNode.parent;
  }

  return false;
}
