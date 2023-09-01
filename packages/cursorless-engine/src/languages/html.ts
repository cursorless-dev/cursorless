import type { SyntaxNode } from "web-tree-sitter";
import type { SimpleScopeTypeType } from "@cursorless/common";
import type {
  NodeMatcherAlternative,
  SelectionWithEditor,
} from "../typings/Types";
import { typedNodeFinder } from "../util/nodeFinders";
import {
  createPatternMatchers,
  leadingMatcher,
  matcher,
  patternMatcher,
} from "../util/nodeMatchers";
import { xmlElementExtractor, getNodeRange } from "../util/nodeSelectors";

const attribute = "*?.attribute!";

const getStartTag = patternMatcher(`*?.start_tag!`);
const getEndTag = patternMatcher(`*?.end_tag!`);

const getTags = (selection: SelectionWithEditor, node: SyntaxNode) => {
  const startTag = getStartTag(selection, node);
  const endTag = getEndTag(selection, node);
  return startTag != null && endTag != null ? startTag.concat(endTag) : null;
};

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  xmlElement: matcher(
    typedNodeFinder("element", "script_element", "style_element"),
    xmlElementExtractor,
  ),
  xmlBothTags: getTags,
  xmlStartTag: getStartTag,
  xmlEndTag: getEndTag,
  attribute: attribute,
  collectionItem: attribute,
  name: "*?.tag_name!",
  collectionKey: ["*?.attribute_name!"],
  value: leadingMatcher(
    ["*?.quoted_attribute_value!.attribute_value", "*?.attribute_value!"],
    ["="],
  ),
  string: "quoted_attribute_value",
  comment: "comment",
};

export const patternMatchers = createPatternMatchers(nodeMatchers);

const textFragmentTypes = ["attribute_value", "raw_text", "text"];

export function stringTextFragmentExtractor(
  node: SyntaxNode,
  _selection: SelectionWithEditor,
) {
  if (textFragmentTypes.includes(node.type)) {
    return getNodeRange(node);
  }

  return null;
}
