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
  comment: "comment",
  collectionKey: "pair[key]",
  value: valueMatcher("*[value]"),
  collectionItem: argumentMatcher("object", "array"),
};

export default createPatternMatchers(nodeMatchers);
