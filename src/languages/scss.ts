import { SyntaxNode } from "web-tree-sitter";
import {
  NodeMatcherAlternative,
  ScopeType,
  SelectionWithEditor,
} from "../typings/Types";
import { patternFinder } from "../util/nodeFinders";
import {
  cascadingMatcher,
  conditionMatcher,
  createPatternMatchers,
  matcher,
  patternMatcher,
  trailingMatcher,
} from "../util/nodeMatchers";
import {
  childRangeSelector,
  delimitedSelector,
  getNodeRange,
} from "../util/nodeSelectors";

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

function isArgumentListDelimiter(node: SyntaxNode) {
  return [",", "(", ")"].includes(node.type) || isAtDelimiter(node);
}

/**
 * Determines whether the given `node` is an `at` delimiter node, used in a css
 * / scss argument list.  For example, the `at` in the call
 * `ellipse(115px 55px at 50% 40%)`
 *
 * @param node The node to check
 * @returns `true` if the node is an `at` delimiter node
 */
function isAtDelimiter(node: SyntaxNode) {
  return node.type === "plain_value" && node.text === "at";
}

/**
 * Matches adjacent nodes returned from {@link siblingFunc} until it reaches a
 * delimiter node.  This is intended to handle the case of multiple values
 * within two delimiters.  e.g. `repeating-linear-gradient(red, orange 50px)`
 * @param siblingFunc returns the previous or next sibling of the current node if present.
 * @returns A non-delimiter node
 */
function findAdjacentArgValues(
  siblingFunc: (node: SyntaxNode) => SyntaxNode | null
) {
  return (node: SyntaxNode) => {
    // Handle the case where we are the cursor is placed before a delimiter, e.g. "|at"
    // and we erroneously expand in both directions.
    if (isAtDelimiter(node) || node.type === ",") {
      node = node.previousSibling!;
    }

    let nextPossibleRange = siblingFunc(node);

    while (nextPossibleRange && !isArgumentListDelimiter(nextPossibleRange)) {
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
      childRangeSelector([], ["attribute_name", "string_value"])
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
        (node) => isArgumentListDelimiter(node),
        ", ",
        findAdjacentArgValues((node) => node.previousSibling),
        findAdjacentArgValues((node) => node.nextSibling)
      )
    )
  ),
  name: [
    "function_statement.name!",
    "declaration.property_name!",
    "declaration.variable_name!",
    "mixin_statement.name!",
    "attribute_selector.attribute_name!",
    "parameter.variable_name!",
  ],
  selector: ["rule_set.selectors!"],
  collectionKey: trailingMatcher(["declaration.property_name!"], [":"]),
  value: cascadingMatcher(
    matcher(
      patternFinder("declaration"),
      childRangeSelector(["property_name", "variable_name"])
    ),
    matcher(
      patternFinder("include_statement", "namespace_statement"),
      childRangeSelector()
    ),
    patternMatcher(
      "return_statement.*!",
      "import_statement.*!",
      "attribute_selector.plain_value!",
      "attribute_selector.string_value!",
      "parameter.default_value!"
    )
  ),
  collectionItem: "declaration",
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
