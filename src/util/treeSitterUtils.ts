import { SyntaxNode } from "web-tree-sitter";

export const getValueNode = (node: SyntaxNode) =>
  node.childForFieldName("value");

export const getLeftNode = (node: SyntaxNode) => node.childForFieldName("left");

export const getNameNode = (node: SyntaxNode) => node.childForFieldName("name");

export const getKeyNode = (node: SyntaxNode) => node.childForFieldName("key");

export const getDefinitionNode = (node: SyntaxNode) =>
  node.childForFieldName("definition");

export const getDeclarationNode = (node: SyntaxNode) =>
  node.childForFieldName("declarator");

export function getChildNodesForFieldName(
  node: SyntaxNode,
  fieldName: string
): SyntaxNode[] {
  const treeCursor = node.walk();
  treeCursor.gotoFirstChild();

  const ret = [];

  let hasNext = true;

  while (hasNext) {
    if (treeCursor.currentFieldName() === fieldName) {
      ret.push(treeCursor.currentNode());
    }

    hasNext = treeCursor.gotoNextSibling();
  }

  return ret;
}
