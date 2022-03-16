import {
  argumentMatcher,
  conditionMatcher,
  createPatternMatchers,
  leadingMatcher,
  trailingMatcher,
} from "../util/nodeMatchers";
import {
  NodeMatcherAlternative,
  ScopeType,
} from "../typings/Types";

const STATEMENT_TYPES = [
  "apply_statement",
  "at_rule",
  "charset_statement",
  "debug_statement",
  "declaration",
  "each_statement",
  "error_statement",
  "for_statement",
  "forward_statement",
  "function_statement",
  "if_statement",
  "import_statement",
  "include_statement",
  "keyframes_statement",
  "media_statement",
  "mixin_statement",
  "namespace_statement",
  "placeholder",
  "rule_set",
  "supports_statement",
  "use_statement",
  "warn_statement",
  "while_statement",
];

const EXPRESSION_TYPES = [
];

const nodeMatchers: Partial<Record<ScopeType, NodeMatcherAlternative>> = {
  // map, list not supported in tree-sitter version
  ifStatement: "if_statement",
  condition: conditionMatcher("condition"),
  statement: STATEMENT_TYPES,
  string: "string_value",
  functionCall: "call_expression",
  namedFunction: ["mixin_statement", "function_statement"],
  functionName: ["mixin_statement.name", "function_statement.name"],
  comment: ["comment", "single_line_comment"],
  argumentOrParameter: argumentMatcher("arguments"),
  collectionKey: trailingMatcher(["property_name", "variable_name"], [":"]),
  // Get values working. Currently everything including an attribute name is at the same level
  // all children of declaration.
  value: leadingMatcher(["declaration.~property_name"], [":"]),
};

export default createPatternMatchers(nodeMatchers);