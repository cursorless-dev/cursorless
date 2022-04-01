import {
  cascadingMatcher,
  conditionMatcher,
  createPatternMatchers,
  matcher,
  patternMatcher,
  trailingMatcher,
} from "../util/nodeMatchers";
import {
  NodeMatcherAlternative,
  ScopeType,
  SelectionWithEditor,
} from "../typings/Types";
import { patternFinder } from "../util/nodeFinders";
import { getNodeRange, childRangeSelector, delimitedSelector } from "../util/nodeSelectors";
import { SyntaxNode } from "web-tree-sitter";
import _ = require("lodash");

// curl https://raw.githubusercontent.com/serenadeai/tree-sitter-scss/c478c6868648eff49eb04a4df90d703dc45b312a/src/node-types.json \
//  | jq '[.[] | select(.type =="stylesheet") | .children.types[] | select(.type !="declaration") | .type ]'

const STATEMENT_TYPES = [
  "apply_statement",
  "at_rule",
  "charset_statement",
  "debug_statement",
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



// Match up until delimiters and including multiple values within delimiters,
// e.g. repeating-linear-gradient(red, orange 50px)
function findAdjacentArgValues(siblingFunc: Function):
  | ((node: SyntaxNode) => SyntaxNode)
  | undefined {
  return (node) => {
    // Handle the case where we are at "|at" and we erroneously expand in both directions.
    if (node.text === "at" || node.text === ",") {
      node = node.previousSibling!;
    }

    let nextPossibleRange = siblingFunc(node);
    while (!_.includes(["at", ",", "(", ")"], nextPossibleRange?.text)) {
      node = nextPossibleRange;
      nextPossibleRange = siblingFunc(nextPossibleRange);
    }
    return node;
  };
}

const nodeMatchers: Partial<Record<ScopeType, NodeMatcherAlternative>> = {
  ifStatement: "if_statement",
  condition: conditionMatcher("condition"),
  statement: cascadingMatcher(
    patternMatcher(...STATEMENT_TYPES),
    matcher(
      patternFinder("attribute_selector"),
      childRangeSelector("inclusion", ["attribute_name", "string_value"])
    )
  ),
  string: "string_value",
  functionCall: "call_expression",
  namedFunction: ["mixin_statement", "function_statement"],
  functionName: ["mixin_statement.name!", "function_statement.name!"],
  comment: ["comment", "single_line_comment"],
  argumentOrParameter: cascadingMatcher(
    matcher(
      patternFinder("arguments.*!", "parameters.*!"),
      delimitedSelector(
        (node) => _.includes(["at", ",", "(", ")"], node.text),
        ", ",
        findAdjacentArgValues((node: SyntaxNode) => node.previousSibling),
        findAdjacentArgValues((node: SyntaxNode) => node.nextSibling)
      )
    ),
  ),
  name: [
    "function_statement.name!",
    "declaration.property_name!",
    "declaration.variable_name!",
    "mixin_statement.name!",
    "attribute_selector.attribute_name!",
  ],
  selector: ["rule_set.selectors!"],
  collectionKey: trailingMatcher(["declaration.property_name!"], [":"]),
  value: cascadingMatcher(
    matcher(
      patternFinder("declaration"),
      childRangeSelector("exclusion", ["property_name", "variable_name"])
    ),
    matcher(
      patternFinder("include_statement", "namespace_statement"),
      childRangeSelector()
    ),
    patternMatcher(
      "return_statement.*!",
      "import_statement.*!",
      "attribute_selector.plain_value!",
      "attribute_selector.string_value!"
    )
  ),
  collectionItem: "declaration"
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