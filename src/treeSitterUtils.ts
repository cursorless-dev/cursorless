import { SyntaxNode } from "web-tree-sitter";

export const getValueNode = (node: SyntaxNode) =>
  node.childForFieldName("value");

export const getTypeNode = (node: SyntaxNode) => {
  const typeAnnotationNode = node.children.find(
    (child) => child.type === "type_annotation"
  );
  return typeAnnotationNode?.lastChild ?? null;
};

export const getKeyNode = (node: SyntaxNode) => node.childForFieldName("key");

export const getDefinitionNode = (node: SyntaxNode) =>
  node.childForFieldName("definition");

export const getDeclarationNode = (node: SyntaxNode) =>
  node.childForFieldName("declaration");
