import {
  argumentMatcher,
  cascadingMatcher,
  createPatternMatchers,
  matcher,
  patternMatcher,
} from "../util/nodeMatchers";
import { NodeMatcherAlternative } from "../typings/Types";
import { SimpleScopeTypeType } from "@cursorless/common";
import {
  childRangeSelector,
  unwrapSelectionExtractor,
} from "../util/nodeSelectors";
import { patternFinder } from "../util/nodeFinders";

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  map: "hash",
  list: "array",
  condition: matcher(
    patternFinder(
      "while_statement[condition]",
      "for_statement_1[condition]",
      "for_statement_2.binary_expression!",
      "for_statement_2.array_variable!",
      "for_simple_statement.binary_expression!",
      "for_simple_statement.array_variable!",
      "if_statement[condition]",
      "unless_statement[condition]",
    ),
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
  functionCallee: cascadingMatcher(
    patternMatcher("call_expression_with_just_name"),
    matcher(
      patternFinder("call_expression", "method_invocation"),
      childRangeSelector(
        ["arguments", "argument", "empty_parenthesized_argument"],
        [],
      ),
    ),
  ),
  comment: "comments",
  namedFunction: ["function_definition"],
  anonymousFunction: "anonymous_function",
  regularExpression: [
    "patter_matcher_m", // Mistype (?) but that is the name in tree-sitter-perl; it must come before pattern_matcher
    "pattern_matcher",
    "regex_pattern_qr",
    "substitution_pattern_s",
  ],
  collectionKey: "key_value_pair[key]",
  collectionItem: "hash[variable]",
  argumentOrParameter: argumentMatcher("arguments"),
  class: [
    "package_statement!.block[body]",
    "source_file!.package_statement",
    "package_statement",
    "source_file",
  ],
  className: "package_statement.package_name!",
  name: ["function_definition[name]", "*[key]"],
  value: ["*[value]"],
};

export const patternMatchers = createPatternMatchers(nodeMatchers);
