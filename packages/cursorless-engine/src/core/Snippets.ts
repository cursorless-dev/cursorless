import type { Snippet, SnippetMap, TextEditor } from "@cursorless/common";

/**
 * Handles all cursorless snippets, including core, third-party and
 * user-defined.  Merges these collections and allows looking up snippets by
 * name.
 */
export interface Snippets {
  updateUserSnippets(): Promise<void>;

  /**
   * Allows extensions to register third-party snippets.  Calling this function
   * twice with the same extensionId will replace the older snippets.
   *
   * Note that third-party snippets take precedence over core snippets, but
   * user snippets take precedence over both.
   * @param extensionId The id of the extension registering the snippets.
   * @param snippets The snippets to be registered.
   */
  registerThirdPartySnippets(extensionId: string, snippets: SnippetMap): void;

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
   * @param dirPath The path to the directory where the snippet should be created
   * @param snippetName The name of the snippet
   * @returns The text editor of the newly created snippet file
   */
  openNewSnippetFile(dirPath: string, snippetName: string): Promise<TextEditor>;
}
