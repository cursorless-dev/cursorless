import { SyntaxNode } from "web-tree-sitter";
import { getNameNode, getKeyNode, getValueNode } from "../treeSitterUtils";
import { selectDelimited, selectWithLeadingDelimiter } from "../nodeSelectors";
import { composedMatcher, matcher, typeMatcher } from "../nodeMatchers";
import { findNode, findNodeOfType } from "../nodeFinders";

export function getPojoMatchers(
  dictionaryTypes: string[],
  listTypes: string[],
  listElementMatcher: (node: SyntaxNode) => boolean
) {
  return {
    dictionary: typeMatcher(...dictionaryTypes),
    pair: matcher(
      findNode((node) => node.type === "pair"),
      selectDelimited(
        (node) => node.type === "," || node.type === "}" || node.type === "{",
        ", "
      )
    ),
    pairKey: composedMatcher([findNodeOfType("pair"), getKeyNode]),
    value: matcher(getValueNode, selectWithLeadingDelimiter),
    name: matcher(getNameNode),
    list: typeMatcher(...listTypes),
    listElement: matcher(
      findNode(
        (node) =>
          listTypes.includes(node.parent?.type ?? "") &&
          listElementMatcher(node)
      ),
      selectDelimited(
        (node) => node.type === "," || node.type === "[" || node.type === "]",
        ", "
      )
    ),
    string: typeMatcher("string"),
  };
}
