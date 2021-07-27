import { SyntaxNode } from "web-tree-sitter";
import { getValueNode } from "../treeSitterUtils";
import {
  delimitersSelector,
  selectWithLeadingDelimiter,
} from "../nodeSelectors";
import { matcher } from "../nodeMatchers";
import { nodeFinder } from "../nodeFinders";

// Matchers for "plain old javascript objects", like those found in JSON
export function getPojoMatchers(
  dictionaryTypes: string[],
  listTypes: string[],
  listElementMatcher: (node: SyntaxNode) => boolean
) {
  return {
    dictionary: dictionaryTypes,
    list: listTypes,
    string: "string",
    collectionKey: "pair[key]",
    value: matcher(getValueNode, selectWithLeadingDelimiter),
    collectionItem: matcher(
      nodeFinder(
        (node) =>
          (listTypes.includes(node.parent?.type ?? "") &&
            listElementMatcher(node)) ||
          node.type === "pair" ||
          node.type === "shorthand_property_identifier" || // Property shorthand
          node.type === "shorthand_property_identifier_pattern" // Deconstructed object
      ),
      delimitersSelector(",", "[", "]", "{", "}")
    ),
  };
}
