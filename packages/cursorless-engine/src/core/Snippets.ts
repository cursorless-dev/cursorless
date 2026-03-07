import type { TextEditor } from "@cursorless/common";

export interface Snippets {
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
