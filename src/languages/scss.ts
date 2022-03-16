import {
  argumentMatcher,
  cascadingMatcher,
  conditionMatcher,
  createPatternMatchers,
  leadingMatcher,
  matcher,
  patternMatcher,
  trailingMatcher,
} from "../util/nodeMatchers";
import {
  NodeMatcherAlternative,
  ScopeType,
} from "../typings/Types";
import { patternFinder } from "../util/nodeFinders";
import { selectChildrenWithExceptions } from "../util/nodeSelectors";

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
  argumentOrParameter: argumentMatcher("arguments", "parameters"),
  name: cascadingMatcher(
    matcher(
      patternFinder(
        "function_statement.name!",
        "declaration.property_name!",
        "declaration.variable_name!"
      )
    )
  ),
  value: cascadingMatcher(
    matcher(
      patternFinder("declaration"),
      selectChildrenWithExceptions(["property_name", "variable_name"])
    ),
    matcher(patternFinder("include_statement"), selectChildrenWithExceptions()),
    patternMatcher("return_statement.*!", "import_statement.*!")
  ),
};

export default createPatternMatchers(nodeMatchers);