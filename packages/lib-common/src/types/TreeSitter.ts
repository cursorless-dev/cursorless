import type { Query, Tree } from "web-tree-sitter";
import type { TextDocument } from "./TextDocument";

export interface TreeSitter {
  /**
   * Loads a language, returning true if it was successfully loaded
   *
   * @param languageId The language id of the language to load
   * @returns `true` if the language was successfully loaded
   */
  loadLanguage(languageId: string): Promise<boolean>;

  /**
   * Function to access the tree sitter tree.
   */
  getTree(document: TextDocument): Tree;

  /**
   * Create a query if the language is loaded.
   *
   * @param languageId The language id of the language to get
   * @param source The query source
   * @returns The query if that language is already loaded
   */
  createQuery(languageId: string, source: string): Query | undefined;
}
