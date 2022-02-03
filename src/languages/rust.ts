import {
  createPatternMatchers,
  argumentMatcher,
  leadingMatcher,
  conditionMatcher,
  trailingMatcher,
} from "../util/nodeMatchers";
import { NodeMatcherAlternative, ScopeType } from "../typings/Types";

const STATEMENT_TYPES = [
  "use_declaration",
  "while_expression",
  "loop_expression",
  "block",
  "mod_item",
  "trait_item",
  "impl_item",
  "struct_item",
  "enum_item",
  "match_expression",
  "return_expression",
  "for_expression",
  "break_expression",
]

const nodeMatchers: Partial<Record<ScopeType, NodeMatcherAlternative>> = {
  statement: STATEMENT_TYPES,
  namedFunction: "function_item",
  string: "string_literal",
  comment: ["line_comment", "block_comment"],
  ifStatement: "if_expression",
  list: "array_expression",
  functionCall: "call_expression",
  name: [
      "let_declaration.identifier!",
      "parameter.identifier!",
  ],
  type: trailingMatcher([
    "parameter.type",
    "generic_type.type_identifier",
    "type_identifier",
    "let_declaration.type",
  ]),
  functionName: [
      "function_item.identifier!"
  ],
  condition: conditionMatcher("condition"),
  argumentOrItem: argumentMatcher("parameters", "parameters")
}
