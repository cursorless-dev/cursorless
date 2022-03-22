import {
  argumentMatcher,
  cascadingMatcher,
  conditionMatcher,
  createPatternMatchers,
  matcher,
  patternMatcher,
} from "../util/nodeMatchers";
import {
  NodeMatcherAlternative,
  ScopeType,
  SelectionWithEditor,
} from "../typings/Types";
import { patternFinder } from "../util/nodeFinders";
import { getNodeRange, selectChildrenWithExceptions } from "../util/nodeSelectors";
import { SyntaxNode } from "web-tree-sitter";

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

const nodeMatchers: Partial<Record<ScopeType, NodeMatcherAlternative>> = {
  // map, list not supported in tree-sitter version
  ifStatement: "if_statement",
  condition: conditionMatcher("condition"),
  // Currently data-lang=^"tel" not treated as a statement
  // a[data-lang^="tel"] {
  //    color: rgba(0, 255, 0, 0.5);
  // }

  statement: STATEMENT_TYPES,
  string: "string_value",
  functionCall: "call_expression",
  namedFunction: ["mixin_statement", "function_statement"],
  // What does `functionName` do?
  functionName: ["mixin_statement.name!", "function_statement.name!"],
  comment: ["comment", "single_line_comment"],
  argumentOrParameter: argumentMatcher("arguments", "parameters"),
  name: cascadingMatcher(
    matcher(
      patternFinder(
        "function_statement.name!",
        "declaration.property_name!",
        "declaration.variable_name!",
        "mixin_statement.name!",
        "attribute_selector.attribute_name!"
      )
    )
  ),
  value: cascadingMatcher(
    matcher(
      patternFinder("declaration"),
      selectChildrenWithExceptions(["property_name", "variable_name"])
    ),
    matcher(
      patternFinder("include_statement", "namespace_statement"),
      selectChildrenWithExceptions()
    ),
    patternMatcher(
      "return_statement.*!",
      "import_statement.*!",
      "attribute_selector.plain_value!",
      "attribute_selector.string_value!"
    )
  ),
};

export const patternMatchers = createPatternMatchers(nodeMatchers);

export function stringTextFragmentExtractor(
  node: SyntaxNode,
  _selection: SelectionWithEditor
) {
  if (node.type === "string_value") {
    return getNodeRange(node);
  }

  return null;
}