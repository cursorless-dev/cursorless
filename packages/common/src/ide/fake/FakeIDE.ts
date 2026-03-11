import { pull } from "lodash-es";
import type { EditableTextEditor, NotebookEditor, TextEditor } from "../..";
import type { GeneralizedRange } from "../../types/GeneralizedRange";
import type { TextDocument } from "../../types/TextDocument";
import type { TextDocumentChangeEvent } from "../types/Events";
import type { FlashDescriptor } from "../types/FlashDescriptor";
import type { QuickPickOptions } from "../types/QuickPickOptions";
import type {
  Event,
  TextEditorSelectionChangeEvent,
  TextEditorVisibleRangesChangeEvent,
} from "../types/events.types";
import type {
  Disposable,
  IDE,
  OpenUntitledTextDocumentOptions,
  RunMode,
  WorkspaceFolder,
} from "../types/ide.types";
import { FakeCapabilities } from "./FakeCapabilities";
import FakeClipboard from "./FakeClipboard";
import FakeConfiguration from "./FakeConfiguration";
import FakeKeyValueStore from "./FakeKeyValueStore";
import FakeMessages from "./FakeMessages";

export class FakeIDE implements IDE {
  configuration: FakeConfiguration = new FakeConfiguration();
  messages: FakeMessages = new FakeMessages();
  keyValueStore: FakeKeyValueStore = new FakeKeyValueStore();
  clipboard: FakeClipboard = new FakeClipboard();
  capabilities: FakeCapabilities = new FakeCapabilities();

  runMode: RunMode = "test";
  cursorlessVersion: string = "0.0.0";
  workspaceFolders: readonly WorkspaceFolder[] | undefined = undefined;
  private disposables: Disposable[] = [];
  private assetsRoot_: string | undefined;
  private quickPickReturnValue: string | undefined = undefined;

  async flashRanges(_flashDescriptors: FlashDescriptor[]): Promise<void> {
    // empty
  }

  async setHighlightRanges(
    _highlightId: string | undefined,
    _editor: TextEditor,
    _ranges: GeneralizedRange[],
  ): Promise<void> {
    // empty
  }

  onDidOpenTextDocument: Event<TextDocument> = dummyEvent;
  onDidCloseTextDocument: Event<TextDocument> = dummyEvent;
  onDidChangeActiveTextEditor: Event<TextEditor | undefined> = dummyEvent;
  onDidChangeVisibleTextEditors: Event<TextEditor[]> = dummyEvent;
  onDidChangeTextEditorSelection: Event<TextEditorSelectionChangeEvent> =
    dummyEvent;
  onDidChangeTextEditorVisibleRanges: Event<TextEditorVisibleRangesChangeEvent> =
    dummyEvent;

  public mockAssetsRoot(_assetsRoot: string) {
    this.assetsRoot_ = _assetsRoot;
  }

  get assetsRoot(): string {
    if (this.assetsRoot_ == null) {
      throw Error("Field `assetsRoot` has not yet been mocked");
    }

    return this.assetsRoot_;
  }

  get activeTextEditor(): TextEditor | undefined {
    throw Error("activeTextEditor: not implemented");
  }

  get activeEditableTextEditor(): EditableTextEditor | undefined {
    throw Error("activeEditableTextEditor: not implemented");
  }

  get visibleTextEditors(): TextEditor[] {
    throw Error("visibleTextEditors: not implemented");
  }

  get visibleNotebookEditors(): NotebookEditor[] {
    throw Error("visibleNotebookEditors: not implemented");
  }

  public getEditableTextEditor(_editor: TextEditor): EditableTextEditor {
    throw Error("getEditableTextEditor: not implemented");
  }

  public findInDocument(_query: string, _editor: TextEditor): Promise<void> {
    throw Error("findInDocument: not implemented");
  }

  public findInWorkspace(_query: string): Promise<void> {
    throw Error("findInWorkspace: not implemented");
  }

  public openTextDocument(_path: string): Promise<TextEditor> {
    throw Error("openTextDocument: not implemented");
  }

  public openUntitledTextDocument(
    _options: OpenUntitledTextDocumentOptions,
  ): Promise<TextEditor> {
    throw Error("openUntitledTextDocument: not implemented");
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
    throw Error("showInputBox: not implemented");
  }

  executeCommand<T>(_command: string, ..._args: any[]): Promise<T | undefined> {
    throw new Error("executeCommand: not implemented");
  }

  public onDidChangeTextDocument(
    _listener: (event: TextDocumentChangeEvent) => void,
  ): Disposable {
    throw Error("onDidChangeTextDocument: not implemented");
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
      // empty
    },
  };
}
