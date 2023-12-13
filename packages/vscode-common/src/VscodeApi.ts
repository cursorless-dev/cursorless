import { window, TextEditor, env, Disposable } from "vscode";

/**
 * Subset of VSCode api that we need to be able to mock for testing
 */
export interface VscodeApi {
  window: typeof window;
  env: typeof env;

  workspace: {
    getConfiguration<T>(configuration: string): T | undefined;
    watchConfiguration<T>(
      configuration: string,
      callback: (value: T | undefined) => void,
    ): Disposable;
    onDidChangeConfiguration(
      configuration: string | string[],
      callback: () => void,
    ): Disposable;
  };

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
