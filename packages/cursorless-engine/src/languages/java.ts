import { argumentMatcher, createPatternMatchers } from "../util/nodeMatchers";

import { SimpleScopeTypeType } from "@cursorless/common";
import { NodeMatcherAlternative } from "../typings/Types";

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  argumentOrParameter: argumentMatcher("formal_parameters", "argument_list"),
};

export default createPatternMatchers(nodeMatchers);
