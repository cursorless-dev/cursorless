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
  type: trailingMatcher(TYPE_TYPES.concat(["*[type]"])),
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
};

export default createPatternMatchers(nodeMatchers);
