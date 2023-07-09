import {
  createPatternMatchers,
  argumentMatcher,
  conditionMatcher,
  cascadingMatcher,
  patternMatcher,
} from "../util/nodeMatchers";
import { NodeMatcherAlternative } from "../typings/Types";
import { SimpleScopeTypeType } from "@cursorless/common";

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  map: "composite_literal",
  list: ["composite_literal", "slice_type", "array_type"],
  ifStatement: "if_statement",
  functionCall: ["call_expression", "composite_literal"],
  functionCallee: ["call_expression[function]", "composite_literal[type]"],
  namedFunction: ["function_declaration", "method_declaration"],
  type: [
    "pointer_type",
    "qualified_type",
    "type_identifier",
    "function_declaration[result]",
    "method_declaration[result]",
  ],
  functionName: ["function_declaration[name]", "method_declaration[name]"],
  anonymousFunction: "func_literal",
  condition: conditionMatcher("*[condition]"),
  argumentOrParameter: cascadingMatcher(
    argumentMatcher("argument_list", "parameter_list"),
    patternMatcher("parameter_declaration"),
    patternMatcher("argument_declaration"),
  ),
  collectionKey: "keyed_element[0]",
  value: cascadingMatcher(
    patternMatcher("keyed_element[1]"),
    patternMatcher("return_statement.expression_list!"),
  ),
};

export default createPatternMatchers(nodeMatchers);
