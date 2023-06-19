import type {
  EditableTextEditor,
  InputBoxOptions,
  ScopeType,
  TextDocument,
  TextEditor,
} from "../..";
import { URI } from "vscode-uri";
import { GeneralizedRange } from "../../types/GeneralizedRange";
import { Capabilities } from "./Capabilities";
import { Clipboard } from "./Clipboard";
import { Configuration } from "./Configuration";
import { TextDocumentChangeEvent } from "./Events";
import {
  Event,
  TextEditorSelectionChangeEvent,
  TextEditorVisibleRangesChangeEvent,
} from "./events.types";
import { FlashDescriptor } from "./FlashDescriptor";
import { Messages } from "./Messages";
import { QuickPickOptions } from "./QuickPickOptions";
import { State } from "./State";

export type RunMode = "production" | "development" | "test";
export type HighlightId = string;

export interface IDE {
  readonly configuration: Configuration;
  readonly messages: Messages;
  readonly globalState: State;
  readonly clipboard: Clipboard;

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
   * @return An editor for the text document at the given path
   */
  openTextDocument(path: string): Promise<TextEditor>;

  /**
   * An event that is emitted when a {@link TextDocument text document} is opened or when the language id
   * of a text document {@link languages.setTextDocumentLanguage has been changed}.
   *
   * To add an event listener when a visible text document is opened, use the {@link TextEditor} events in the
   * {@link window} namespace. Note that:
   *
   * - The event is emitted before the {@link TextDocument document} is updated in the
   * {@link window.activeTextEditor active text editor}
   * - When a {@link TextDocument text document} is already open (e.g.: open in another {@link window.visibleTextEditors visible text editor}) this event is not emitted
   *
   */
  onDidOpenTextDocument: Event<TextDocument>;

  /**
   * An event that is emitted when a {@link TextDocument text document} is disposed or when the language id
   * of a text document {@link languages.setTextDocumentLanguage has been changed}.
   *
   * *Note 1:* There is no guarantee that this event fires when an editor tab is closed, use the
   * {@linkcode window.onDidChangeVisibleTextEditors onDidChangeVisibleTextEditors}-event to know when editors change.
   *
   * *Note 2:* A document can be open but not shown in an editor which means this event can fire
   * for a document that has not been shown in an editor.
   */
  onDidCloseTextDocument: Event<TextDocument>;

  /**
   * An {@link Event} which fires when the {@link window.activeTextEditor active editor}
   * has changed. *Note* that the event also fires when the active editor changes
   * to `undefined`.
   */
  onDidChangeActiveTextEditor: Event<TextEditor | undefined>;

  /**
   * An {@link Event} which fires when the array of {@link window.visibleTextEditors visible editors}
   * has changed.
   */
  onDidChangeVisibleTextEditors: Event<TextEditor[]>;

  /**
   * An {@link Event} which fires when the selection in an editor has changed.
   */
  onDidChangeTextEditorSelection: Event<TextEditorSelectionChangeEvent>;

  /**
   * An {@link Event} which fires when the visible ranges of an editor has changed.
   */
  onDidChangeTextEditorVisibleRanges: Event<TextEditorVisibleRangesChangeEvent>;

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

  /**
   * Shows a selection list.
   *
   * @param items An array of string choices to present to the user.
   * @param options Configures the behavior of the selection list.
   * @return A promise that resolves to the selection or `undefined`.
   */
  showQuickPick(
    items: readonly string[],
    options?: QuickPickOptions,
  ): Promise<string | undefined>;

  /**
   * Executes the built-in ide command denoted by the given command identifier.
   *
   * @param command Identifier of the command to execute.
   * @param args Parameters passed to the command function.
   * @return A promise that resolves to the returned value of the given command.
   * `undefined` when the command handler function doesn't return anything.
   */
  executeCommand<T>(command: string, ...args: any[]): Promise<T | undefined>;

  /**
   * Temporarily emphasize the given ranges to the user.  This function is used
   * to show ranges that eg are about to be deleted, are the source of a bring,
   * etc. The promise should resolve when the flash is complete.
   *
   * @param flashDescriptors Descriptions of the ranges to flash, including
   * information about the type of flash
   */
  flashRanges(flashDescriptors: FlashDescriptor[]): Promise<void>;

  /**
   * Set the ranges in {@link editor} to which {@link highlightId} should be
   * applied.  Removes the given highlight from all other ranges in
   * {@link editor}.
   *
   * @param highlightId The id of the highlight to apply; if undefined then
   * should use whatever the default highlight is for this ide
   * @param editor The editor for which to set highlights ranges
   * @param ranges The ranges to apply the highlight to
   */
  setHighlightRanges(
    highlightId: HighlightId | undefined,
    editor: TextEditor,
    ranges: GeneralizedRange[],
  ): Promise<void>;

  setScopeVisualizationRanges(scopeRanges: EditorScopeRanges[]): Promise<void>;
}

export interface EditorScopeRanges {
  editor: TextEditor;
  scopeRanges: ScopeRanges[];
}

export interface ScopeRanges {
  scopeType: ScopeType;
  domain: GeneralizedRange;
  contentRanges?: GeneralizedRange[];
  removalRanges?: GeneralizedRange[];
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
