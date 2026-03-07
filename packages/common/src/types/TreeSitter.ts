import type { Range, TextDocument } from "@cursorless/common";
import type { Node, Query, Tree } from "web-tree-sitter";

export interface TreeSitter {
  /**
   * Function to access nodes in the tree sitter.
   */
  getNodeAtLocation(document: TextDocument, range: Range): Node;

  /**
   * Function to access the tree sitter tree.
   */
  getTree(document: TextDocument): Tree;

  /**
   * Loads a language, returning true if it was successfully loaded
   *
   * @param languageId The language id of the language to load
   * @returns `true` if the language was successfully loaded
   */
  loadLanguage(languageId: string): Promise<boolean>;

  /**
   * Create a query if the language is loaded.
   *
   * @param languageId The language id of the language to get
   * @param source The query source
   * @returns The query if that language is already loaded
   */
  createQuery(languageId: string, source: string): Query | undefined;
}
