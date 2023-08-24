import type { SyntaxNode } from "web-tree-sitter";
import type { SimpleScopeTypeType } from "@cursorless/common";
import type {
  NodeMatcherAlternative,
  SelectionWithEditor,
} from "../typings/Types";
import {
  createPatternMatchers,
  leadingMatcher,
  trailingMatcher,
} from "../util/nodeMatchers";
import { getNodeRange } from "../util/nodeSelectors";

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  map: "object",
  list: "array",
  string: "string",
  collectionKey: trailingMatcher(["pair[key]"], [":"]),
  value: leadingMatcher(["*[value]"], [":"]),
};

export const patternMatchers = createPatternMatchers(nodeMatchers);

export function stringTextFragmentExtractor(
  node: SyntaxNode,
  _selection: SelectionWithEditor,
) {
  if (node.type === "string_content") {
    return getNodeRange(node);
  }

  return null;
}
