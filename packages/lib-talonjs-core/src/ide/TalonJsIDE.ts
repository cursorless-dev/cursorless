import { pull } from "lodash-es";
import type {
  Capabilities,
  Clipboard,
  Configuration,
  Disposable,
  EditableTextEditor,
  EmittableIDE,
  FlashDescriptor,
  GeneralizedRange,
  InputBoxOptions,
  KeyValueStore,
  Listener,
  Messages,
  NotebookEditor,
  OpenUntitledTextDocumentOptions,
  QuickPickOptions,
  RunMode,
  TextDocument,
  TextDocumentChangeEvent,
  TextEditor,
  TextEditorSelectionChangeEvent,
  TextEditorVisibleRangesChangeEvent,
  WorkspaceFolder,
} from "@cursorless/lib-common";
import { InMemoryTextEditor, Notifier } from "@cursorless/lib-common";
import type { Talon } from "../types/talon";
import type { EditorEdit, EditorState } from "../types/types";
import { flashRanges } from "./flashRanges";
import { TalonJsCapabilities } from "./TalonJsCapabilities";
import { TalonJsClipboard } from "./TalonJsClipboard";
import { TalonJsConfiguration } from "./TalonJsConfiguration";
import { TalonJsKeyValueStore } from "./TalonJsKeyValueStore";
import { TalonJsMessages } from "./TalonJsMessages";

export class TalonJsIDE implements EmittableIDE {
  configuration: Configuration;
  messages: Messages;
  keyValueStore: KeyValueStore;
  clipboard: Clipboard;
  capabilities: Capabilities;
  private disposables: Disposable[] = [];
  private editors: EditableTextEditor[] = [];

  private onDidChangeTextDocumentNotifier: Notifier<[TextDocumentChangeEvent]> =
    new Notifier();

  private onDidChangeTextEditorSelectionNotifier: Notifier<
    [TextEditorSelectionChangeEvent]
  > = new Notifier();

  constructor(
    private talon: Talon,
    public runMode: RunMode,
  ) {
    this.configuration = new TalonJsConfiguration();
    this.messages = new TalonJsMessages(talon);
    this.keyValueStore = new TalonJsKeyValueStore();
    this.clipboard = new TalonJsClipboard(talon);
    this.capabilities = new TalonJsCapabilities();
  }

  get assetsRoot(): string {
    throw new Error("assetsRoot: not implemented");
  }

  get cursorlessVersion(): string {
    throw new Error("cursorlessVersion: not implemented");
  }

  get workspaceFolders(): readonly WorkspaceFolder[] | undefined {
    throw new Error("workspaceFolders: not implemented");
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

  get visibleNotebookEditors(): NotebookEditor[] {
    return [];
  }

  getEditableTextEditor(editor: TextEditor): EditableTextEditor {
    if (editor instanceof InMemoryTextEditor) {
      return editor;
    }
    throw new Error(`Unsupported text editor type: ${editor}`);
  }

  updateTextEditors(editorState: EditorState) {
    const editor = new InMemoryTextEditor({
      ide: this,
      languageId: editorState.languageId,
      content: editorState.text,
      selections: editorState.selections,
    });
    this.editors = [editor];
  }

  findInDocument(query: string, editor?: TextEditor): Promise<void> {
    if (editor != null) {
      throw new Error(
        "findInDocument not implemented for other than active editor.",
      );
    }
    this.talon.actions.edit.find(query);
    return Promise.resolve();
  }

  findInWorkspace(_query: string): Promise<void> {
    throw new Error("findInWorkspace: not implemented");
  }

  openTextDocument(_path: string): Promise<TextEditor> {
    throw new Error("openTextDocument: not implemented");
  }

  openUntitledTextDocument(
    _options?: OpenUntitledTextDocumentOptions,
  ): Promise<TextEditor> {
    throw new Error("openUntitledTextDocument: not implemented");
  }

  showInputBox(_options?: InputBoxOptions): Promise<string | undefined> {
    throw new Error("showInputBox: not implemented");
  }

  showQuickPick(
    _items: readonly string[],
    _options?: QuickPickOptions,
  ): Promise<string | undefined> {
    throw new Error("showQuickPick: not implemented");
  }

  executeCommand<T>(_command: string, ..._args: any[]): Promise<T | undefined> {
    throw new Error("executeCommand: not implemented");
  }

  flashRanges(flashDescriptors: FlashDescriptor[]): Promise<void> {
    return flashRanges(this.talon, flashDescriptors);
  }

  setHighlightRanges(
    _highlightId: string | undefined,
    _editor: TextEditor,
    _ranges: GeneralizedRange[],
  ): Promise<void> {
    throw new Error("setHighlightRanges: not implemented");
  }

  onDidChangeTextDocument(
    listener: Listener<[TextDocumentChangeEvent]>,
  ): Disposable {
    return this.onDidChangeTextDocumentNotifier.registerListener(listener);
  }

  emitDidChangeTextDocument(event: TextDocumentChangeEvent) {
    const { document, contentChanges } = event;

    const editorEdit: EditorEdit = {
      text: document.getText(),
      changes: contentChanges.map((change) => ({
        rangeOffset: change.rangeOffset,
        rangeLength: change.rangeLength,
        text: change.text,
      })),
    };

    this.talon.actions.user.cursorless_everywhere_edit_text(editorEdit);

    this.onDidChangeTextDocumentNotifier.notifyListeners(event);
  }

  onDidChangeTextEditorSelection(
    listener: (event: TextEditorSelectionChangeEvent) => void,
  ): Disposable {
    return this.onDidChangeTextEditorSelectionNotifier.registerListener(
      listener,
    );
  }

  emitDidChangeTextEditorSelection(
    event: TextEditorSelectionChangeEvent,
  ): void {
    const { document } = event.textEditor;

    const selectionOffsets = event.selections.map((selection) => ({
      anchor: document.offsetAt(selection.anchor),
      active: document.offsetAt(selection.active),
    }));

    this.talon.actions.user.cursorless_everywhere_set_selections(
      selectionOffsets,
    );

    this.onDidChangeTextEditorSelectionNotifier.notifyListeners(event);
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
