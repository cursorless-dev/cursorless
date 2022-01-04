import {
  createPatternMatchers,
  leadingMatcher,
  patternMatcher,
} from "../util/nodeMatchers";
import {
  ScopeType,
  NodeMatcherAlternative,
  SelectionWithEditor,
} from "../typings/Types";
import { SyntaxNode } from "web-tree-sitter";
import { getNodeRange } from "../util/nodeSelectors";

const attribute = "*?.attribute!";

const getStartTag = patternMatcher(`*?.start_tag!`);
const getEndTag = patternMatcher(`*?.end_tag!`);

const getTags = (selection: SelectionWithEditor, node: SyntaxNode) => {
  const startTag = getStartTag(selection, node);
  const endTag = getEndTag(selection, node);
  return startTag != null && endTag != null ? startTag.concat(endTag) : null;
};
const nodeMatchers: Partial<Record<ScopeType, NodeMatcherAlternative>> = {
  xmlElement: ["element", "script_element", "style_element"],
  xmlBothTags: getTags,
  xmlStartTag: getStartTag,
  xmlEndTag: getEndTag,
  attribute: attribute,
  collectionItem: attribute,
  name: "*?.tag_name!",
  collectionKey: ["*?.attribute_name!"],
  value: leadingMatcher(
    ["*?.quoted_attribute_value!.attribute_value", "*?.attribute_value!"],
    ["="]
  ),
  string: "quoted_attribute_value",
  comment: "comment",
};

export const patternMatchers = createPatternMatchers(nodeMatchers);

const textFragmentTypes = ["attribute_value", "raw_text", "text"];

export function stringTextFragmentExtractor(
  node: SyntaxNode,
  selection: SelectionWithEditor
) {
  if (textFragmentTypes.includes(node.type)) {
    return getNodeRange(node);
  }

  return null;
}
