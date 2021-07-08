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
    pair: matcher(
      nodeFinder((node) => node.type === "pair"),
      delimitedSelector(
        (node) => node.type === "," || node.type === "}" || node.type === "{",
        ", "
      )
    ),
    pairKey: composedMatcher([typedNodeFinder("pair"), getKeyNode]),
    value: matcher(getValueNode, selectWithLeadingDelimiter),
    list: typeMatcher(...listTypes),
    listElement: matcher(
      nodeFinder(
        (node) =>
          listTypes.includes(node.parent?.type ?? "") &&
          listElementMatcher(node)
      ),
      delimitedSelector(
        (node) => node.type === "," || node.type === "[" || node.type === "]",
        ", "
      )
    ),
    string: typeMatcher("string"),
  };
}
