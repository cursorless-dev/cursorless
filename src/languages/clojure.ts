import { createPatternMatchers, matcher } from "../util/nodeMatchers";
import {
  ScopeType,
  NodeMatcherAlternative,
  SelectionWithContext,
} from "../typings/Types";
import { SyntaxNode } from "web-tree-sitter";
import { Position, Selection, TextEditor } from "vscode";
import {
  delimitedSelector,
  makeRangeFromPositions,
} from "../util/nodeSelectors";
import { identity } from "lodash";
import { getChildNodesForFieldName } from "../util/treeSitterUtils";

function parityNodeFinder(parity: 0 | 1) {
  return (node: SyntaxNode) => {
    const parent = node.parent;

    if (
      parent == null ||
      parent.type !== "map_lit" ||
      node.type === "{" ||
      node.type === "}"
    ) {
      return null;
    }

    const valueNodes = getChildNodesForFieldName(parent, "value");

    const nodeIndex = valueNodes.findIndex(({ id }) => id === node.id);

    return valueNodes[Math.floor(nodeIndex / 2) * 2 + parity];
  };
}

const nodeMatchers: Partial<Record<ScopeType, NodeMatcherAlternative>> = {
  comment: "comment",
  map: "map_lit",

  collectionKey: matcher(parityNodeFinder(0)),
  collectionItem: matcher(
    parityNodeFinder(0),
    delimitedSelector(
      (node) => node.type === "{" || node.type === "}",
      ", ",
      identity,
      parityNodeFinder(1) as (node: SyntaxNode) => SyntaxNode
    )
  ),
  value: matcher(parityNodeFinder(1)),

  // A list is either a vector literal or a quoted list literal
  list: ["vec_lit", "quoting_lit.list_lit"],

  string: "str_lit",

  // A function call is a list literal which is not quoted
  functionCall: "~quoting_lit.list_lit!",
};

export default createPatternMatchers(nodeMatchers);
