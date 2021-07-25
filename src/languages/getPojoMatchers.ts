import { SyntaxNode } from "web-tree-sitter";
import { getKeyNode, getValueNode } from "../treeSitterUtils";
import {
  delimitedSelector,
  selectWithLeadingDelimiter,
} from "../nodeSelectors";
import { composedMatcher, matcher, typeMatcher } from "../nodeMatchers";
import { nodeFinder, typedNodeFinder } from "../nodeFinders";

// Matchers for "plain old javascript objects", like those found in JSON
export function getPojoMatchers(
  dictionaryTypes: string[],
  listTypes: string[],
  listElementMatcher: (node: SyntaxNode) => boolean
) {
  return {
    dictionary: typeMatcher(...dictionaryTypes),
    collectionKey: composedMatcher([typedNodeFinder("pair"), getKeyNode]),
    value: matcher(getValueNode, selectWithLeadingDelimiter),
    list: typeMatcher(...listTypes),
    collectionItem: matcher(
      nodeFinder(
        (node) =>
          (listTypes.includes(node.parent?.type ?? "") &&
            listElementMatcher(node)) ||
          node.type === "pair" ||
          node.type === "shorthand_property_identifier"
      ),
      delimitedSelector(
        (node) =>
          node.type === "," ||
          node.type === "[" ||
          node.type === "]" ||
          node.type === "}" ||
          node.type === "{",
        ", "
      )
    ),
    string: typeMatcher("string"),
  };
}
