import {
  createPatternMatchers,
  argumentMatcher,
  valueMatcher,
} from "../nodeMatchers";
import { ScopeType, NodeMatcherAlternative } from "../Types";

const nodeMatchers: Partial<Record<ScopeType, NodeMatcherAlternative>> = {
  dictionary: "object",
  list: "array",
  string: "string",
  collectionItem: argumentMatcher("object", "array"),
  collectionKey: "pair[key]",
  value: valueMatcher("*[value]"),
  comment: "comment",
};

export default createPatternMatchers(nodeMatchers);
