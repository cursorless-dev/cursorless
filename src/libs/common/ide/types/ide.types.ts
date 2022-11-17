import type { EditableTextEditor, TextEditor } from "@cursorless/common";
import { URI } from "vscode-uri";
import { Clipboard } from "./Clipboard";
import { Configuration } from "./Configuration";
import { TextDocumentChangeEvent } from "./Events";
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
