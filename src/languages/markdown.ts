import { NodeMatcherAlternative, ScopeType } from "../typings/Types";
import { createPatternMatchers, leadingMatcher } from "../util/nodeMatchers";

const nodeMatchers: Partial<Record<ScopeType, NodeMatcherAlternative>> = {
  list: ["loose_list", "tight_list"],
  comment: "html_block",
  name: "heading_content",
  collectionItem: leadingMatcher(["list_item.paragraph!"], ["list_marker"]),
};

export default createPatternMatchers(nodeMatchers);
