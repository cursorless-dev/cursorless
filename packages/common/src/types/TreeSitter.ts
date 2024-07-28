import { Range, TextDocument } from "@cursorless/common";
import { Language, SyntaxNode, Tree } from "web-tree-sitter";

export interface TreeSitter {
  /**
   * Function to access nodes in the tree sitter.
   */
  getNodeAtLocation(document: TextDocument, range: Range): SyntaxNode;

  /**
   * Function to access the tree sitter tree.
   */
  getTree(document: TextDocument): Tree;

  /**
   * Gets a language if it is loaded
   *
   * @param languageId The language id of the language to get
   * @returns The language if it is already loaded
   */
  getLanguage(languageId: string): Language | undefined;

  /**
   * Loads a language, returning true if it was successfully loaded
   *
   * @param languageId The language id of the language to load
   * @returns `true` if the language was successfully loaded
   */
  loadLanguage(languageId: string): Promise<boolean>;
}
