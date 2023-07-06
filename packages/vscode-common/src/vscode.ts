import { workspace, window, TextEditor } from "vscode";

/**
 * Subset of VSCode api that we need to be able to mock for testing
 */
export interface Vscode {
  workspace: typeof workspace;
  window: typeof window;

  /**
   * Wrapper around editor api for easy mocking.  Provides various
   * {@link TextEditor} methods as static functions which take a text editor as
   * their first argument.
   */
  editor: {
    setDecorations(
      editor: TextEditor,
      ...args: Parameters<TextEditor["setDecorations"]>
    ): ReturnType<TextEditor["setDecorations"]>;
  };
}
