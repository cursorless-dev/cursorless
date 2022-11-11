import { URI } from "vscode-uri";
import { Clipboard } from "./Clipboard";
import { Configuration } from "./Configuration";
import { Messages } from "./Messages";
import { State } from "./State";
import type { EditableTextEditor, TextEditor } from "./TextEditor";

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
  readonly assetsRoot: string;

  /**
   * Whether we are running in development, test, or production
   */
  readonly runMode: RunMode;

  /**
   * A list of workspace folders for the currently active workspace
   */
  readonly workspaceFolders: readonly WorkspaceFolder[] | undefined;

  /**
   * The currently active editor or `undefined`. The active editor is the one
   * that currently has focus or, when none has focus, the one that has changed
   * input most recently.
   */
  readonly activeTextEditor: TextEditor | undefined;

  /**
   * Same as {@link activeTextEditor} but editable
   */
  readonly activeEditableTextEditor: EditableTextEditor | undefined;

  /**
   * Get an editable version of the text editor.
   * @param editor A editable text editor
   */
  getEditableTextEditor(editor: TextEditor): EditableTextEditor;
}

export interface WorkspaceFolder {
  uri: URI;
  name: string;
}

export interface Disposable {
  dispose(): void;
}

/**
 * Represents an end of line character sequence in a {@link TextDocument document}.
 */
export type EndOfLine = "LF" | "CRLF";
