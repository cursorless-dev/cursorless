import { workspace, window, TextEditor, env } from "vscode";

/**
 * Subset of VSCode api that we need to be able to mock for testing
 */
export interface VscodeApi {
  workspace: typeof workspace;
  window: typeof window;
  env: typeof env;

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
