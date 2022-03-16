import {
  argumentMatcher,
  createPatternMatchers,
  leadingMatcher,
  trailingMatcher,
} from "../util/nodeMatchers";
import {
  NodeMatcherAlternative,
  ScopeType,
} from "../typings/Types";

// curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-css/f13775ea604c9c56eab4e5b0dc4e5120a64dce9a/src/node-types.json \
// | jq '[.[] | select(.type =="stylesheet") | .children.types[].type]'

const STATEMENT_TYPES = [
  "at_rule", 
  "charset_statement",
  "declaration",
  "import_statement",
  "keyframes_statement",
  "media_statement",
  "namespace_statement",
  "rule_set",
  "supports_statement"
];

const EXPRESSION_TYPES = [
];

const nodeMatchers: Partial<Record<ScopeType, NodeMatcherAlternative>> = {
  statement: STATEMENT_TYPES,
  string: "string_value",
  functionCall: "call_expression",
  comment: "comment",
  argumentOrParameter: argumentMatcher("arguments"),
  collectionKey: trailingMatcher(["property_name"], [":"]),
  // Get values working. Currently everything including an attribute name is at the same level
  // all children of declaration.
  value: leadingMatcher([
      "declaration.~property_name"
  ], [':']),
};
export default createPatternMatchers(nodeMatchers);