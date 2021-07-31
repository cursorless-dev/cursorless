import { getPojoMatchers } from "./getPojoMatchers";
import { notSupported, createPatternMatchers } from "../nodeMatchers";
import { ScopeType, NodeMatcherAlternative } from "../Types";

const nodeMatchers: Partial<Record<ScopeType, NodeMatcherAlternative>> = {
  ...getPojoMatchers(["object"], ["array"]),
  ifStatement: notSupported,
  class: notSupported,
  className: notSupported,
  statement: notSupported,
  arrowFunction: notSupported,
  functionCall: notSupported,
  argumentOrParameter: notSupported,
  namedFunction: notSupported,
  functionName: notSupported,
  comment: notSupported,
  regex: notSupported,
  type: notSupported,
  name: notSupported,
};

export default createPatternMatchers(nodeMatchers);
