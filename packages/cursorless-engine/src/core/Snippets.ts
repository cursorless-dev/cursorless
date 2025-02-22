import type { Snippet, TextEditor } from "@cursorless/common";

/**
 * Handles all cursorless snippets, including core, third-party and
 * user-defined.  Merges these collections and allows looking up snippets by
 * name.
 */
export interface Snippets {
  /**
   * Looks in merged collection of snippets for a snippet with key
   * `snippetName`. Throws an exception if the snippet of the given name could
   * not be found
   * @param snippetName The name of the snippet to look up
   * @returns The named snippet
   */
  getSnippetStrict(snippetName: string): Snippet;

  /**
   * Opens a new snippet file
   * @param snippetName The name of the snippet
   * @param directory The path to the directory where the snippet should be created
   * @returns The text editor of the newly created snippet file
   */
  openNewSnippetFile(
    snippetName: string,
    directory: string,
  ): Promise<TextEditor>;
}
