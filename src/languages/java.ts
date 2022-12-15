import {
  createPatternMatchers,
  argumentMatcher,
  leadingMatcher,
  conditionMatcher,
  trailingMatcher,
  matcher,
  cascadingMatcher,
} from "../util/nodeMatchers";
import { childRangeSelector } from "../util/nodeSelectors";
import { patternFinder } from "../util/nodeFinders";

import { NodeMatcherAlternative } from "../typings/Types";
import { SimpleScopeTypeType } from "../core/commandRunner/typings/targetDescriptor.types";

// Generated by the following command:
// > curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-java/master/src/node-types.json | jq '[.[] | select(.type == "statement" or .type == "declaration") | .subtypes[].type]'
const STATEMENT_TYPES = [
  "annotation_type_declaration",
  "class_declaration",
  "enum_declaration",
  "import_declaration",
  "interface_declaration",
  "module_declaration",
  "package_declaration",
  "assert_statement",
  "break_statement",
  "continue_statement",
  "declaration",
  "do_statement",
  "enhanced_for_statement",
  "expression_statement",
  "for_statement",
  "if_statement",
  "labeled_statement",
  "local_variable_declaration",
  "return_statement",
  "switch_expression",
  "synchronized_statement",
  "throw_statement",
  "try_statement",
  "try_with_resources_statement",
  "while_statement",
  "yield_statement",

  // exceptions
  // ";",
  // "block",
  "switch_statement",
  "method_declaration",
  "constructor_declaration",
  "field_declaration",
];

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  statement: STATEMENT_TYPES,
  class: "class_declaration",
  className: "class_declaration[name]",
  ifStatement: "if_statement",
  string: "string_literal",
  comment: ["line_comment", "block_comment", "comment"],
  anonymousFunction: "lambda_expression",
  list: "array_initializer",
  functionCall: [
    "method_invocation",
    "object_creation_expression",
    "explicit_constructor_invocation",
  ],
  functionCallee: cascadingMatcher(
    matcher(
      patternFinder("method_invocation"),
      childRangeSelector(["argument_list"], []),
    ),
    matcher(
      patternFinder("object_creation_expression"),
      childRangeSelector(["argument_list"], []),
    ),
    matcher(
      patternFinder("explicit_constructor_invocation"),
      childRangeSelector(["argument_list", ";"], []),
    ),
  ),
  map: "block",
  name: [
    "*[declarator][name]",
    "assignment_expression[left]",
    "*[name]",
    "formal_parameter.identifier!",
  ],
  namedFunction: ["method_declaration", "constructor_declaration"],
  type: trailingMatcher([
    "generic_type.type_arguments.type_identifier",
    "generic_type.type_identifier",
    "type_identifier",
    "local_variable_declaration[type]",
    "array_creation_expression[type]",
    "formal_parameter[type]",
    "method_declaration[type]",
  ]),
  functionName: [
    "method_declaration.identifier!",
    "constructor_declaration.identifier!",
  ],
  value: leadingMatcher(
    [
      "*[declarator][value]",
      "assignment_expression[right]",
      "return_statement[0]",
      "*[value]",
    ],
    ["=", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<=", ">>="],
  ),
  condition: conditionMatcher("*[condition]"),
  argumentOrParameter: argumentMatcher("formal_parameters", "argument_list"),
};

export default createPatternMatchers(nodeMatchers);
