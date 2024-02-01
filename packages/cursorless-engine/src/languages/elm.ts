import { SimpleScopeTypeType } from "@cursorless/common";
import { NodeMatcherAlternative } from "../typings/Types";
import { createPatternMatchers } from "../util/nodeMatchers";

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  map: ["record_expr", "record_pattern"],
  list: ["list_expr", "list_pattern"],
  statement: [
    // not all of these are "statements" in Elm, but they fit the usage pattern in Cursorless
    "let_in_expr",
    "case_of_expr",
    "port_annotation",
    "infix_declaration",
    "if_else_expr",
  ],
  string: "string_constant_expr",
  collectionItem: ["exposed_value"],
  collectionKey: ["field_type[name]", "record_expr.field![name]"],
  ifStatement: "if_else_expr",
  anonymousFunction: "anonymous_function_expr",
  functionCall: "function_call_expr",
  functionCallee: "function_call_expr[target][name]",
  comment: ["block_comment", "line_comment"],
  namedFunction: "value_declaration",
  functionName: "value_declaration[functionDeclarationLeft][0]",
  condition: "if_else_expr[0]",
  type: [
    "type_ref",
    "field_type[typeExpression]",
    "type_expression",
    "type_declaration",
    "type_annotation[typeExpression]!",
    "type_alias_declaration",
    // TODO: select type from within function (needs to find the previous sibling of the parent `value_decoration`)
  ],
  name: [
    "type_annotation[name]",
    "port_annotation[name]",
    "type_declaration[name]",
    "type_alias_declaration[name]",
    "value_declaration.function_declaration_left.lower_case_identifier!",
  ],
  value: [
    "record_expr[field][expression]",
    "value_declaration[body]",
    "case_of_branch[expr]",
    "let_in_expr[body]",
  ],
  argumentOrParameter: [
    "value_declaration.function_declaration_left[pattern]!",
  ],
};

export default createPatternMatchers(nodeMatchers);
