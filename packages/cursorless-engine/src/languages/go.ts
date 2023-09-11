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
  ifStatement: "if_statement",
  functionCall: ["call_expression", "composite_literal"],
  functionCallee: ["call_expression[function]", "composite_literal[type]"],
  type: [
    "pointer_type",
    "qualified_type",
    "type_identifier",
    "function_declaration[result]",
    "method_declaration[result]",
  ],
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
