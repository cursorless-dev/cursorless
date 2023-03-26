import { createPatternMatchers, matcher } from "../util/nodeMatchers";
import { NodeMatcherAlternative, SelectionWithEditor } from "../typings/Types";
import { SimpleScopeTypeType } from "@cursorless/common";
import { SyntaxNode } from "web-tree-sitter";
import { getNodeRange, unwrapSelectionExtractor } from "../util/nodeSelectors";
import { patternFinder } from "../util/nodeFinders";

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  map: "hash",
  list: "array",
  condition: matcher(
    patternFinder("while_statement[condition]"),
    unwrapSelectionExtractor,
  ),
  string: [
    "string_single_quoted",
    "string_double_quoted",
    "string_q_quoted",
    "string_qq_quoted",
  ],
  ifStatement: "if_statement",
  functionCall: [
    "call_expression",
    "call_expression_with_just_name",
    "method_invocation",
  ],
  comment: "comments",
  namedFunction: ["function_definition"],
  anonymousFunction: "anonymous_function",
  regularExpression: [
    "patter_matcher_m", // Mistype (?) but that is the name in tree-sitter-perl; it must come before pattern_matcher
    "pattern_matcher",
    "regex_pattern_qr",
    "substitution_pattern_s",
  ],
  collectionKey: "*[key]",
  collectionItem: "hash[variable]",
  argumentOrParameter: ["argument", "parenthesized_argument.arguments!"],
  className: "package_statement.package_name!",
};

export const patternMatchers = createPatternMatchers(nodeMatchers);

export function stringTextFragmentExtractor(
  node: SyntaxNode,
  _selection: SelectionWithEditor,
) {
  // heredoc_content does not seem to supported by tree-sitter-perl,
  // leaving it anyway since it won't hurt
  if (node.type === "string_content" || node.type === "heredoc_content") {
    return getNodeRange(node);
  }

  return null;
}
