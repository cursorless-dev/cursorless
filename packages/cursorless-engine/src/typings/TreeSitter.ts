import { Range, TextDocument } from "@cursorless/common";
import { SyntaxNode, Tree } from "web-tree-sitter";

export interface TreeSitter {
  /**
   * Function to access nodes in the tree sitter.
   */
  readonly getNodeAtLocation: (
    document: TextDocument,
    range: Range,
  ) => SyntaxNode;

  /**
   * Function to access the tree sitter tree.
   */
  readonly getTree: (document: TextDocument) => Tree;
}
