import type { SimpleSyntaxNode } from "./QueryCapture";

/**
 * Checks if a node is at an even index within its parent's field.
 *
 * @param node - The node to check.
 * @param fieldName - The name of the field in the parent node.
 * @returns True if the node is at an even index, false otherwise.
 */
export function isEven(node: SimpleSyntaxNode, fieldName: string): boolean {
  if (node.parent == null) {
    throw Error("Node has no parent");
  }

  const treeCursor = node.parent.walk();
  let hasNext = treeCursor.gotoFirstChild();
  let even = true;

  while (hasNext) {
    if (treeCursor.currentFieldName === fieldName) {
      if (treeCursor.currentNode.id === node.id) {
        return even;
      }
      even = !even;
    }
    hasNext = treeCursor.gotoNextSibling();
  }

  throw Error(`Node not found in parent for field: ${fieldName}`);
}
