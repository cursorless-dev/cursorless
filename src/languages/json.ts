import {
  createPatternMatchers,
  argumentMatcher,
  leadingMatcher,
  trailingMatcher,
} from "../util/nodeMatchers";
import {
  ScopeType,
  NodeMatcherAlternative,
  SelectionWithEditor,
} from "../typings/Types";
import { SyntaxNode } from "web-tree-sitter";
import { getNodeRange } from "../util/nodeSelectors";

const nodeMatchers: Partial<Record<ScopeType, NodeMatcherAlternative>> = {
  map: "object",
  list: "array",
  string: "string",
  comment: "comment",
  collectionKey: trailingMatcher(["pair[key]"], [":"]),
  value: leadingMatcher(["*[value]"], [":"]),
  collectionItem: argumentMatcher("object", "array"),
};

export const patternMatchers = createPatternMatchers(nodeMatchers);

export function textFragmentExtractor(
  node: SyntaxNode,
  selection: SelectionWithEditor
) {
  if (node.type === "string_content") {
    return getNodeRange(node);
  }

  return null;
}
