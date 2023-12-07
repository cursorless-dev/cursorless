import { SimpleScopeTypeType } from "@cursorless/common";
import { NodeMatcherAlternative } from "../typings/Types";
import { createPatternMatchers } from "../util/nodeMatchers";

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {};

export const patternMatchers = createPatternMatchers(nodeMatchers);
