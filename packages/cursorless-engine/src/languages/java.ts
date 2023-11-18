import {
  createPatternMatchers,
  argumentMatcher,
  leadingMatcher,
  trailingMatcher,
  matcher,
  cascadingMatcher,
} from "../util/nodeMatchers";
import { childRangeSelector } from "../util/nodeSelectors";
import { patternFinder } from "../util/nodeFinders";

import { NodeMatcherAlternative } from "../typings/Types";
import { SimpleScopeTypeType } from "@cursorless/common";

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
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
  name: [
    "*[declarator][name]",
    "assignment_expression[left]",
    "*[name]",
    "formal_parameter.identifier!",
  ],
  type: trailingMatcher([
    "generic_type.type_arguments.type_identifier",
    "generic_type.type_identifier",
    "generic_type.scoped_type_identifier.type_identifier",
    "type_identifier",
    "local_variable_declaration[type]",
    "array_creation_expression[type]",
    "formal_parameter[type]",
    "method_declaration[type]",
  ]),
  value: leadingMatcher(
    [
      "*[declarator][value]",
      "assignment_expression[right]",
      "return_statement[0]",
      "*[value]",
    ],
    ["=", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<=", ">>="],
  ),
  argumentOrParameter: argumentMatcher("formal_parameters", "argument_list"),
};

export default createPatternMatchers(nodeMatchers);
