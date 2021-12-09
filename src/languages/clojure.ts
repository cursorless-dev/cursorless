import { createPatternMatchers } from "../util/nodeMatchers";
import { ScopeType, NodeMatcherAlternative } from "../typings/Types";

const nodeMatchers: Partial<Record<ScopeType, NodeMatcherAlternative>> = {
  comment: "comment",
  map: "map_lit",

  // A list is either a vector literal or a quoted list literal
  list: ["vec_lit", "quoting_lit.list_lit"],

  string: "str_lit",

  // A function call is a list literal which is not quoted
  functionCall: "~quoting_lit.list_lit!",
};

export default createPatternMatchers(nodeMatchers);
