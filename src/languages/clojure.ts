import {
  cascadingMatcher,
  createPatternMatchers,
  matcher,
} from "../util/nodeMatchers";
import { ScopeType, NodeMatcherAlternative } from "../typings/Types";
import { SyntaxNode } from "web-tree-sitter";
import { delimitedSelector } from "../util/nodeSelectors";
import { identity } from "lodash";
import { getChildNodesForFieldName } from "../util/treeSitterUtils";

function parityNodeFinder(parity: 0 | 1) {
  return indexNodeFinder(
    (nodeIndex: number) => Math.floor(nodeIndex / 2) * 2 + parity,
    "map_lit"
  );
}

function indexNodeFinder(
  indexMatcher: (index: number) => number,
  parentType?: string
) {
  return (node: SyntaxNode) => {
    const parent = node.parent;

    if (
      parent == null ||
      (parentType != null && parent.type !== parentType) ||
      node.type === "{" ||
      node.type === "}"
    ) {
      return null;
    }

    const valueNodes = getChildNodesForFieldName(parent, "value");

    const nodeIndex = valueNodes.findIndex(({ id }) => id === node.id);

    if (nodeIndex === -1) {
      // TODO: In the future we might conceivably try to handle saying "take
      // item" when the selection is inside a comment between the key and value
      return null;
    }

    const desiredIndex = indexMatcher(nodeIndex);

    if (desiredIndex === -1) {
      return null;
    }

    return valueNodes[desiredIndex];
  };
}

function itemFinder() {
  return indexNodeFinder((nodeIndex: number) => nodeIndex);
}

const nodeMatchers: Partial<Record<ScopeType, NodeMatcherAlternative>> = {
  comment: "comment",
  map: "map_lit",

  collectionKey: matcher(parityNodeFinder(0)),
  collectionItem: cascadingMatcher(
    matcher(
      parityNodeFinder(0),
      delimitedSelector(
        (node) => node.type === "{" || node.type === "}",
        ", ",
        identity,
        parityNodeFinder(1) as (node: SyntaxNode) => SyntaxNode
      )
    ),
    // TODO: Require parent not to be a function call
    matcher(itemFinder())
  ),
  value: matcher(parityNodeFinder(1)),

  // TODO: Require parent to actually be a function call
  argumentOrParameter: matcher(
    indexNodeFinder((nodeIndex: number) => (nodeIndex !== 0 ? nodeIndex : -1))
  ),

  // A list is either a vector literal or a quoted list literal
  list: ["vec_lit", "quoting_lit.list_lit"],

  string: "str_lit",

  // A function call is a list literal which is not quoted
  functionCall: "~quoting_lit.list_lit!",
};

export default createPatternMatchers(nodeMatchers);
