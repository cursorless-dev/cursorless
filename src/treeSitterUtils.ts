import { SyntaxNode } from "web-tree-sitter";

export const getValueNode = (node: SyntaxNode) =>
  node.childForFieldName("value");

export const getLeftNode = (node: SyntaxNode) => node.childForFieldName("left");

export const getNameNode = (node: SyntaxNode) => node.childForFieldName("name");

export const getKeyNode = (node: SyntaxNode) => node.childForFieldName("key");

export const getDefinitionNode = (node: SyntaxNode) =>
  node.childForFieldName("definition");

export const getDeclarationNode = (node: SyntaxNode) =>
  node.childForFieldName("declaration");
