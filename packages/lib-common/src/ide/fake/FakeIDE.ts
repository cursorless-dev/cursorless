import { pull } from "lodash-es";
import type { GeneralizedRange } from "../../types/GeneralizedRange";
import type { NotebookEditor } from "../../types/NotebookEditor";
import type { TextDocument } from "../../types/TextDocument";
import type { EditableTextEditor, TextEditor } from "../../types/TextEditor";
import type { TextDocumentChangeEvent } from "../types/Events";
import type { FlashDescriptor } from "../types/FlashDescriptor";
import type { Messages } from "../types/Messages";
import type { QuickPickOptions } from "../types/QuickPickOptions";
import type {
  Emit,
  Event,
  TextEditorSelectionChangeEvent,
  TextEditorVisibleRangesChangeEvent,
} from "../types/events.types";
import type {
  Disposable,
  EmittableIDE,
  OpenUntitledTextDocumentOptions,
  RunMode,
  WorkspaceFolder,
} from "../types/ide.types";
import { FakeCapabilities } from "./FakeCapabilities";
import FakeClipboard from "./FakeClipboard";
import FakeConfiguration from "./FakeConfiguration";
import FakeKeyValueStore from "./FakeKeyValueStore";
import FakeMessages from "./FakeMessages";

export class FakeIDE implements EmittableIDE {
  configuration = new FakeConfiguration();
  keyValueStore = new FakeKeyValueStore();
  clipboard = new FakeClipboard();
  capabilities = new FakeCapabilities();
  messages: Messages;

  runMode: RunMode = "test";
  cursorlessVersion: string = "0.0.0";
  workspaceFolders: readonly WorkspaceFolder[] | undefined = undefined;
  private disposables: Disposable[] = [];
  private assetsRoot_: string | undefined;
  private quickPickReturnValue: string | undefined = undefined;

  constructor(messages: Messages = new FakeMessages()) {
    this.messages = messages;
  }

  async flashRanges(_flashDescriptors: FlashDescriptor[]): Promise<void> {
    // Empty
  }

  async setHighlightRanges(
    _highlightId: string | undefined,
    _editor: TextEditor,
    _ranges: GeneralizedRange[],
  ): Promise<void> {
    // Empty
  }

  onDidOpenTextDocument: Event<TextDocument> = dummyEvent;
  onDidCloseTextDocument: Event<TextDocument> = dummyEvent;
  onDidChangeActiveTextEditor: Event<TextEditor | undefined> = dummyEvent;
  onDidChangeVisibleTextEditors: Event<TextEditor[]> = dummyEvent;
  onDidChangeTextEditorSelection: Event<TextEditorSelectionChangeEvent> =
    dummyEvent;
  onDidChangeTextEditorVisibleRanges: Event<TextEditorVisibleRangesChangeEvent> =
    dummyEvent;
  onDidChangeTextDocument: Event<TextDocumentChangeEvent> = dummyEvent;

  emitDidChangeTextDocument: Emit<TextDocumentChangeEvent> = dummyEmit;
  emitDidChangeTextEditorSelection: Emit<TextEditorSelectionChangeEvent> =
    dummyEmit;

  mockAssetsRoot(_assetsRoot: string) {
    this.assetsRoot_ = _assetsRoot;
  }

  get assetsRoot(): string {
    if (this.assetsRoot_ == null) {
      throw new Error("Field `assetsRoot` has not yet been mocked");
    }

    return this.assetsRoot_;
  }

  get activeTextEditor(): TextEditor | undefined {
    throw new Error("activeTextEditor: not implemented");
  }

  get activeEditableTextEditor(): EditableTextEditor | undefined {
    throw new Error("activeEditableTextEditor: not implemented");
  }

  get visibleTextEditors(): TextEditor[] {
    return [];
  }

  get visibleNotebookEditors(): NotebookEditor[] {
    return [];
  }

  public getEditableTextEditor(_editor: TextEditor): EditableTextEditor {
    throw new Error("getEditableTextEditor: not implemented");
  }

  public findInDocument(_query: string, _editor: TextEditor): Promise<void> {
    throw new Error("findInDocument: not implemented");
  }

  public findInWorkspace(_query: string): Promise<void> {
    throw new Error("findInWorkspace: not implemented");
  }

  public openTextDocument(_path: string): Promise<TextEditor> {
    throw new Error("openTextDocument: not implemented");
  }

  public openUntitledTextDocument(
    _options: OpenUntitledTextDocumentOptions,
  ): Promise<TextEditor> {
    throw new Error("openUntitledTextDocument: not implemented");
  }

  public setQuickPickReturnValue(value: string | undefined) {
    this.quickPickReturnValue = value;
  }

  public async showQuickPick(
    _items: readonly string[],
    _options?: QuickPickOptions,
  ): Promise<string | undefined> {
    return this.quickPickReturnValue;
  }

  public showInputBox(_options?: any): Promise<string | undefined> {
    throw new Error("showInputBox: not implemented");
  }

  executeCommand<T>(_command: string, ..._args: any[]): Promise<T | undefined> {
    throw new Error("executeCommand: not implemented");
  }

  disposeOnExit(...disposables: Disposable[]): () => void {
    this.disposables.push(...disposables);

    return () => pull(this.disposables, ...disposables);
  }

  exit(): void {
    this.disposables.forEach((disposable) => disposable.dispose());
  }
}

function dummyEvent() {
  return {
    dispose() {
      // Empty
    },
  };
}

function dummyEmit() {
  // Empty
}
