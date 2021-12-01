import {
  createPatternMatchers,
  argumentMatcher,
  leadingMatcher,
  trailingMatcher,
} from "../util/nodeMatchers";
import { ScopeType, NodeMatcherAlternative } from "../typings/Types";

const nodeMatchers: Partial<Record<ScopeType, NodeMatcherAlternative>> = {
  map: "object",
  list: "array",
  string: "string",
  comment: "comment",
  collectionKey: trailingMatcher(["pair[key]"], [":"]),
  value: leadingMatcher(["*[value]"], [":"]),
  collectionItem: argumentMatcher("object", "array"),
};

export default createPatternMatchers(nodeMatchers);
