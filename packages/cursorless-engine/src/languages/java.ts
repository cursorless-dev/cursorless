import {
  argumentMatcher,
  createPatternMatchers,
  leadingMatcher,
} from "../util/nodeMatchers";

import { SimpleScopeTypeType } from "@cursorless/common";
import { NodeMatcherAlternative } from "../typings/Types";

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
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
