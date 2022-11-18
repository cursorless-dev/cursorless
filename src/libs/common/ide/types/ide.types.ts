import type {
  EditableTextEditor,
  InputBoxOptions,
  TextEditor,
} from "@cursorless/common";
import { URI } from "vscode-uri";
import { Capabilities } from "./Capabilities";
import { Clipboard } from "./Clipboard";
import { Configuration } from "./Configuration";
import { TextDocumentChangeEvent } from "./Events";
import { Messages } from "./Messages";
import { State } from "./State";

export type RunMode = "production" | "development" | "test";

export interface IDE {
  readonly configuration: Configuration;
  readonly  messages: Messages;
  readonly  globalState: State;
  readonly  clipboard: Clipboard;

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
   * The currently visible editors or an empty array.
   */
  readonly visibleTextEditors: TextEditor[];

  /**
   * The capabilities of the IDE
   */
  readonly capabilities: Capabilities;

  /**
   * Get an editable version of the text editor.
   * @param editor A editable text editor
   */
  getEditableTextEditor(editor: TextEditor): EditableTextEditor;

  /**
   * An event that is emitted when a {@link TextDocument text document} is changed. This usually happens
   * when the {@link TextDocument.getText contents} changes but also when other things like the
   * {@link TextDocument.isDirty dirty}-state changes.
   */
  onDidChangeTextDocument(
    listener: (event: TextDocumentChangeEvent) => void,
  ): Disposable;

  /**
   * Find occurrences of query string in all files in the workspace
   * @param query The string query to search for
   */
  findInWorkspace(query: string): Promise<void>;

  /**
   * Opens a document.
   *
   * @see {@link openTextDocument}
   * @param path A path to a file on disk.
   */
  openTextDocument(path: string): Promise<void>;

  /**
   * Opens an input box to ask the user for input.
   *
   * The returned value will be `undefined` if the input box was canceled (e.g. pressing ESC). Otherwise the
   * returned value will be the string typed by the user or an empty string if the user did not type
   * anything but dismissed the input box with OK.
   *
   * @param options Configures the behavior of the input box.
   * @return A promise that resolves to a string the user provided or to `undefined` in case of dismissal.
   */
  showInputBox(options?: InputBoxOptions): Promise<string | undefined>;
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
