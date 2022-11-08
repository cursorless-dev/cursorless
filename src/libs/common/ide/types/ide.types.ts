import { URI } from "vscode-uri";
import { Clipboard } from "./Clipboard";
import { Configuration } from "./Configuration";
import { Messages } from "./Messages";
import { State } from "./State";

export type RunMode = "production" | "development" | "test";

export interface IDE {
  configuration: Configuration;
  messages: Messages;
  globalState: State;
  clipboard: Clipboard;

  /**
   * Register disposables to be disposed of on IDE exit.
   *
   * @param disposables A list of {@link Disposable}s to dispose when the IDE is exited.
   * @returns A function that can be called to deregister the disposables
   */
  disposeOnExit(...disposables: Disposable[]): () => void;

  /**
   * The root directory of this shipped code.  Can be used to access bundled
   * assets.
   */
  assetsRoot: string;

  /**
   * Whether we are running in development, test, or production
   */
  runMode: RunMode;

  /**
   * A list of workspace folders for the currently active workspace
   */
  workspaceFolders: readonly WorkspaceFolder[] | undefined;
}

export interface WorkspaceFolder {
  uri: URI;
  name: string;
}

export interface Disposable {
  dispose(): void;
}
