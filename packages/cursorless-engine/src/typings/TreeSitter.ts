import { Range, TextDocument } from "@cursorless/common";
import { SyntaxNode } from "web-tree-sitter";

export interface TreeSitter {
  /**
   * Function to access nodes in the tree sitter.
   */
  readonly getNodeAtLocation: (document: TextDocument, range: Range) => SyntaxNode;
}
