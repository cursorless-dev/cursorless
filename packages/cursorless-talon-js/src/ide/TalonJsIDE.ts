import {
  Capabilities,
  Clipboard,
  Configuration,
  Disposable,
  EditableTextEditor,
  FlashDescriptor,
  GeneralizedRange,
  IDE,
  InputBoxOptions,
  Listener,
  Messages,
  Notifier,
  OpenUntitledTextDocumentOptions,
  QuickPickOptions,
  RunMode,
  State,
  TextDocument,
  TextDocumentChangeEvent,
  TextEditor,
  TextEditorSelectionChangeEvent,
  TextEditorVisibleRangesChangeEvent,
  WorkspaceFolder,
} from "@cursorless/common";
import { pull } from "lodash-es";
import type { DocumentState } from "../types/types";
import { TalonJsCapabilities } from "./TalonJsCapabilities";
import { TalonJsClipboard } from "./TalonJsClipboard";
import { TalonJsConfiguration } from "./TalonJsConfiguration";
import { TalonJsEditor } from "./TalonJsEditor";
import { TalonJsMessages } from "./TalonJsMessages";
import { TalonJsState } from "./TalonJsState";
import { createTextEditor } from "./createTextEditor";

export class TalonJsIDE implements IDE {
  configuration: Configuration;
  messages: Messages;
  globalState: State;
  clipboard: Clipboard;
  capabilities: Capabilities;
  private disposables: Disposable[] = [];
  private editors: EditableTextEditor[] = [];

  private onDidChangeTextDocumentNotifier: Notifier<[TextDocumentChangeEvent]> =
    new Notifier();

  constructor() {
    this.configuration = new TalonJsConfiguration();
    this.messages = new TalonJsMessages();
    this.globalState = new TalonJsState();
    this.clipboard = new TalonJsClipboard();
    this.capabilities = new TalonJsCapabilities();
  }

  get assetsRoot(): string {
    throw new Error("assetsRoot not implemented.");
  }

  get cursorlessVersion(): string {
    throw new Error("cursorlessVersion not implemented.");
  }

  get workspaceFolders(): readonly WorkspaceFolder[] | undefined {
    throw new Error("workspaceFolders not implemented.");
  }

  get runMode(): RunMode {
    return "production";
  }

  get activeTextEditor(): TextEditor | undefined {
    return this.activeEditableTextEditor;
  }

  get activeEditableTextEditor(): EditableTextEditor | undefined {
    return this.editors[0];
  }

  get visibleTextEditors(): TextEditor[] {
    return this.editors;
  }

  getEditableTextEditor(editor: TextEditor): EditableTextEditor {
    if (editor instanceof TalonJsEditor) {
      return editor;
    }
    throw Error(`Unsupported text editor type: ${editor}`);
  }

  updateTextEditors(documentState: DocumentState) {
    this.editors = [createTextEditor(this, documentState)];
  }

  findInDocument(
    _query: string,
    _editor?: TextEditor | undefined,
  ): Promise<void> {
    throw new Error("findInDocument not implemented.");
  }

  findInWorkspace(_query: string): Promise<void> {
    throw new Error("findInWorkspace not implemented.");
  }

  openTextDocument(_path: string): Promise<TextEditor> {
    throw new Error("openTextDocument not implemented.");
  }

  openUntitledTextDocument(
    _options?: OpenUntitledTextDocumentOptions | undefined,
  ): Promise<TextEditor> {
    throw new Error("openUntitledTextDocument not implemented.");
  }

  showInputBox(
    _options?: InputBoxOptions | undefined,
  ): Promise<string | undefined> {
    throw new Error("showInputBox not implemented.");
  }

  showQuickPick(
    _items: readonly string[],
    _options?: QuickPickOptions | undefined,
  ): Promise<string | undefined> {
    throw new Error("showQuickPick not implemented.");
  }

  executeCommand<T>(_command: string, ..._args: any[]): Promise<T | undefined> {
    throw new Error("executeCommand not implemented.");
  }

  flashRanges(_flashDescriptors: FlashDescriptor[]): Promise<void> {
    return Promise.resolve();
  }

  setHighlightRanges(
    _highlightId: string | undefined,
    _editor: TextEditor,
    _ranges: GeneralizedRange[],
  ): Promise<void> {
    throw new Error("setHighlightRanges not implemented.");
  }

  onDidChangeTextDocument(
    listener: Listener<[TextDocumentChangeEvent]>,
  ): Disposable {
    return this.onDidChangeTextDocumentNotifier.registerListener(listener);
  }

  emitDidChangeTextDocument(event: TextDocumentChangeEvent) {
    this.onDidChangeTextDocumentNotifier.notifyListeners(event);
  }

  onDidOpenTextDocument(
    _listener: (document: TextDocument) => void,
  ): Disposable {
    return { dispose: () => {} };
  }

  onDidCloseTextDocument(
    _listener: (document: TextDocument) => void,
  ): Disposable {
    return { dispose: () => {} };
  }

  onDidChangeActiveTextEditor(
    _listener: (editor: TextEditor | undefined) => void,
  ): Disposable {
    return { dispose: () => {} };
  }

  onDidChangeVisibleTextEditors(
    _listener: (editors: TextEditor[]) => void,
  ): Disposable {
    return { dispose: () => {} };
  }

  onDidChangeTextEditorSelection(
    _listener: (event: TextEditorSelectionChangeEvent) => void,
  ): Disposable {
    return { dispose: () => {} };
  }

  onDidChangeTextEditorVisibleRanges(
    _listener: (event: TextEditorVisibleRangesChangeEvent) => void,
  ): Disposable {
    return { dispose: () => {} };
  }

  disposeOnExit(...disposables: Disposable[]): () => void {
    this.disposables.push(...disposables);

    return () => pull(this.disposables, ...disposables);
  }
}
