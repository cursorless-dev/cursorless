import {
  createPatternMatchers,
  argumentMatcher,
  leadingMatcher,
  trailingMatcher,
} from "../util/nodeMatchers";
import { NodeMatcherAlternative } from "../typings/Types";
import { SimpleScopeTypeType } from "@cursorless/common";

// >  curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-cpp/master/src/node-types.json | jq '[.[] | select(.type == "_type_specifier") | .subtypes[].type]'
const TYPE_TYPES = [
  "auto",
  "class_specifier",
  "decltype",
  "dependent_type",
  "enum_specifier",
  "primitive_type",
  "scoped_type_identifier",
  "sized_type_specifier",
  "struct_specifier",
  "template_type",
  "type_identifier",
  "union_specifier",
];

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  ["private.switchStatementSubject"]: "switch_statement[condition][value]",
  anonymousFunction: "lambda_expression",
  list: "initializer_list",
  functionCall: ["call_expression", "declaration.init_declarator!"],
  functionCallee: [
    "call_expression[function]",
    "declaration.init_declarator[declarator]!",
  ],
  name: [
    "*[declarator][declarator][name]",
    "*[declarator][name]",
    "*[declarator][declarator]",
    "*[declarator]",
    "assignment_expression[left]",
    "*[name]",
  ],
  namedFunction: ["function_definition", "declaration.function_declarator"],
  type: trailingMatcher(TYPE_TYPES.concat(["*[type]"])),
  functionName: [
    "function_definition[declarator][declarator][name]", // void C::funcName() {}
    "function_definition[declarator][declarator]", // void funcName() {}
    "declaration.function_declarator![declarator]", // void funcName();
  ],
  value: leadingMatcher(
    [
      "*[declarator][value]",
      "*[value]",
      "assignment_expression[right]",
      "optional_parameter_declaration[default_value]",
    ],
    [":", "=", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<=", ">>="],
  ),
  argumentOrParameter: argumentMatcher("parameter_list", "argument_list"),
  attribute: "attribute",
};

export default createPatternMatchers(nodeMatchers);
