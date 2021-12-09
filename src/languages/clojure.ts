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
  comment: "comment",
  map: "map_lit",
  list: ["vec_lit", "quoting_lit.list_lit"],
  string: "str_lit",
  functionCall: "~quoting_lit.list_lit!",
};

export default createPatternMatchers(nodeMatchers);
