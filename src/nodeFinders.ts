import { SyntaxNode } from "web-tree-sitter";
import { NodeFinder } from "./Types";

export const findNode =
  (isTargetNode: (node: SyntaxNode) => boolean): NodeFinder =>
  (node: SyntaxNode) => {
    return isTargetNode(node) ? node : null;
  };

export const findNodeOfType =
  (...typeNames: string[]): NodeFinder =>
  (node: SyntaxNode) => {
    return typeNames.includes(node.type) ? node : null;
  };

/**
 * Creates a matcher that can match potentially wrapped nodes. For example
 * typescript export statements or python decorators
 * @param isWrapperNode Returns node if the given node has the right type to be
 * a wrapper node
 * @param isTargetNode Returns node if the given node has the right type to be
 * the target
 * @param getWrappedNodes Given a wrapper node returns a list of possible
 * target nodes
 * @returns A matcher that will return the given target node or the wrapper
 * node, if it is wrapping a target node
 */
export function findPossiblyWrappedNode(
  isWrapperNode: NodeFinder,
  isTargetNode: NodeFinder,
  getWrappedNodes: (node: SyntaxNode) => (SyntaxNode | null)[]
): NodeFinder {
  return (node: SyntaxNode) => {
    if (node.parent != null && isWrapperNode(node.parent)) {
      // We don't want to return the target node if it is wrapped.  We return
      // null, knowing that the ancestor walk will call us again with the
      // wrapper node
      return null;
    }

    if (isWrapperNode(node)) {
      const isWrappingTargetNode = getWrappedNodes(node).some(
        (node) => node != null && isTargetNode(node)
      );

      if (isWrappingTargetNode) {
        return node;
      }
    }

    return isTargetNode(node) ? node : null;
  };
}
