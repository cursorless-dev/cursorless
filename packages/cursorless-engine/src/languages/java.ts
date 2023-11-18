import {
  createPatternMatchers,
  argumentMatcher,
  leadingMatcher,
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
