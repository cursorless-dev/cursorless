import { SyntaxNode } from "web-tree-sitter";
import { NodeMatcher } from "../typings/Types";
import { matcher } from "../util/nodeMatchers";

/**
 * Constructs a matcher for matching ternary branches.  Branches are expected to
 * be named children at particular indices of a ternary node.
 *
 * NB: We can't just use the "foo[0]" syntax of our pattern language because
 * that just uses `foo` for the finder; the `[0]` is just part of the extractor,
 * so if we had `foo[0]` and `foo[1]`, they would both match for either branch.
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
