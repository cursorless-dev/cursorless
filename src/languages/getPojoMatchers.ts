import { SyntaxNode } from "web-tree-sitter";
import { TextEditor } from "vscode";
import {
  delimitedMatcher,
  hasType,
  simpleSelectionExtractor,
  childNodeMatcher,
  getNodeWithLeadingDelimiter,
} from "../nodeMatchers";
import { getNameNode, getKeyNode, getValueNode } from "../treeSitterUtils";

export function getPojoMatchers(
  dictionaryTypes: string[],
  listTypes: string[],
  listElementMatcher: (node: SyntaxNode) => boolean
) {
  return {
    dictionary: hasType(...dictionaryTypes),
    pair: delimitedMatcher(
      (node) => node.type === "pair",
      (node) => node.type === "," || node.type === "}" || node.type === "{",
      ", "
    ),
    pairKey(editor: TextEditor, node: SyntaxNode) {
      if (node.type !== "pair") {
        return null;
      }

      return simpleSelectionExtractor(getKeyNode(node)!);
    },
    value: childNodeMatcher(getValueNode, getNodeWithLeadingDelimiter),
    name: childNodeMatcher(getNameNode, simpleSelectionExtractor),
    list: hasType(...listTypes),
    listElement: delimitedMatcher(
      (node) =>
        listTypes.includes(node.parent?.type ?? "") && listElementMatcher(node),
      (node) => node.type === "," || node.type === "[" || node.type === "]",
      ", "
    ),
    string: hasType("string"),
  };
}
