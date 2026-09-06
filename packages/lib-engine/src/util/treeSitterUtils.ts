import type { Node } from "web-tree-sitter";

export const getValueNode = (node: Node) => node.childForFieldName("value");

export const getLeftNode = (node: Node) => node.childForFieldName("left");

export const getNameNode = (node: Node) => node.childForFieldName("name");

export const getKeyNode = (node: Node) => node.childForFieldName("key");

export const getDefinitionNode = (node: Node) =>
  node.childForFieldName("definition");

export const getDeclarationNode = (node: Node) =>
  node.childForFieldName("declarator");

export function getChildNodesForFieldName(
  node: Node,
  fieldName: string,
): Node[] {
  const treeCursor = node.walk();
  treeCursor.gotoFirstChild();

  const ret = [];

  let hasNext = true;

  while (hasNext) {
    if (treeCursor.currentFieldName === fieldName) {
      ret.push(treeCursor.currentNode);
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
 * @returns A list of ancestors possibly including the includeNode node itself
 */
export function getAncestors(node: Node, includeNode: boolean = true) {
  const ancestors: Node[] = includeNode ? [node] : [];

  for (
    let currentNode: Node | null = node.parent;
    currentNode != null;
    currentNode = currentNode.parent
  ) {
    ancestors.push(currentNode);
  }

  return ancestors;
}

/**
 * Determines whether the given node or one of its ancestors is an error node
 * @param node The node to check
 * @returns True if the given node is contained in an error node
 */
export function isContainedInErrorNode(node: Node) {
  return getAncestors(node).some((ancestor) => ancestor.type === "ERROR");
}
