import type {
  Capabilities,
  Clipboard,
  Configuration,
  Disposable,
  EditableTextEditor,
  FlashDescriptor,
  GeneralizedRange,
  IDE,
  InputBoxOptions,
  Messages,
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
import { actions } from "talon";
import { TalonJsCapabilities } from "./TalonJsCapabilities";
import { TalonJsClipboard } from "./TalonJsClipboard";
import { TalonJsConfiguration } from "./TalonJsConfiguration";
import { TalonJsMessages } from "./TalonJsMessages";
import { TalonJsState } from "./TalonJsState";
import { createTextEditor } from "./createTextEditor";
import { TalonJsEditor } from "./TalonJsEditor";

export class TalonJsIDE implements IDE {
  configuration: Configuration;
  messages: Messages;
  globalState: State;
  clipboard: Clipboard;
  capabilities: Capabilities;
  private disposables: Disposable[] = [];
  private editors: EditableTextEditor[] = [];

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

  updateTextEditor() {
    const documentState = actions.user.cursorless_js_get_document_state();
    const editor = createTextEditor(documentState);
    this.editors = [editor];
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
    throw new Error("flashRanges not implemented.");
  }

  setHighlightRanges(
    _highlightId: string | undefined,
    _editor: TextEditor,
    _ranges: GeneralizedRange[],
  ): Promise<void> {
    throw new Error("setHighlightRanges not implemented.");
  }

  onDidChangeTextDocument(
    _listener: (event: TextDocumentChangeEvent) => void,
  ): Disposable {
    return { dispose: () => {} };
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
