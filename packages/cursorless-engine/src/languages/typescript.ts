import { SimpleScopeTypeType } from "@cursorless/common";
import { NodeMatcherAlternative } from "../typings/Types";
import { argumentMatcher, createPatternMatchers } from "../util/nodeMatchers";

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  collectionItem: "jsx_attribute",
  argumentOrParameter: argumentMatcher("formal_parameters", "arguments"),
};

export const patternMatchers = createPatternMatchers(nodeMatchers);
