import { SyntaxNode } from "web-tree-sitter";
import { NodeMatcher } from "../typings/Types";
import { matcher } from "../util/nodeMatchers";

/**
 * Constructs a matcher for matching ternary branches.  Branches are expected to
 * be named children at particular indices of a ternary node.
 * @param ternaryTypename The type name for ternary expressions
 * @param acceptableNamedChildIndices Which named children, by index, of the
 * ternary node correspond to branches
 * @returns A matcher that can match ternary branches
 */
export function ternaryBranchMatcher(
  ternaryTypename: string,
  acceptableNamedChildIndices: number[],
): NodeMatcher {
  function finder(node: SyntaxNode) {
    const parent = node.parent;
    if (parent == null) {
      return null;
    }

    if (
      parent.type === ternaryTypename &&
      acceptableNamedChildIndices.some((index) =>
        parent.namedChild(index)!.equals(node),
      )
    ) {
      return node;
    }

    return null;
  }

  return matcher(finder);
}
