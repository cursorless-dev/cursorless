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

/**
 * Returns a list of the node's ancestors, including the node itself if
 * `includeNode` is `true`
 * @param node The node to iterate ancestors from
 * @param includeNode Whether to include the node itself in the returned list
 * @returns A list of ancestors possibly including the node itself
 */
export function getAncestors(node: SyntaxNode, includeNode: boolean) {
  const ancestors = includeNode ? [node] : [];
  const treeCursor = node.walk();

  let hasNext = treeCursor.gotoParent();

  while (hasNext) {
    ancestors.push(treeCursor.currentNode());
    hasNext = treeCursor.gotoParent();
  }

  return ancestors;
}

export function isContainedInErrorNode(node: SyntaxNode) {
  const ancestors = getAncestors(node, true);

  return ancestors.some((ancestor) => ancestor.type === "ERROR");
}
