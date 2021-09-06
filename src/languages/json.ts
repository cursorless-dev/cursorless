import {
  createPatternMatchers,
  argumentMatcher,
  prefixedMatcher,
  suffixedMatcher,
} from "../util/nodeMatchers";
import { ScopeType, NodeMatcherAlternative } from "../typings/Types";

const nodeMatchers: Partial<Record<ScopeType, NodeMatcherAlternative>> = {
  map: "object",
  list: "array",
  string: "string",
  comment: "comment",
  collectionKey: suffixedMatcher("pair[key]"),
  value: prefixedMatcher("*[value]"),
  collectionItem: argumentMatcher("object", "array"),
};

export default createPatternMatchers(nodeMatchers);
