import { SimpleScopeTypeType } from "@cursorless/common";
import { NodeMatcherAlternative } from "../typings/Types";
import { createPatternMatchers, leadingMatcher } from "../util/nodeMatchers";

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  value: leadingMatcher(
    [
      "variable_declaration?.variable_declarator[1][0]!",
      "assignment_expression[right]",
    ],
    ["assignment_operator"],
  ),
};

export default createPatternMatchers(nodeMatchers);
