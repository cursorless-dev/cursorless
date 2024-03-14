// adapted from packages\common\src\ide\fake\FakeIDE.ts
// and packages\cursorless-vscode\src\ide\vscode\VscodeIDE.ts
import type { EditableTextEditor, TextEditor } from "@cursorless/common";
import { GeneralizedRange } from "@cursorless/common";
import { TextDocument } from "@cursorless/common";
import type { TextDocumentChangeEvent } from "@cursorless/common";
import { FlashDescriptor } from "@cursorless/common";
import { QuickPickOptions } from "@cursorless/common";
import {
  Event,
  TextEditorSelectionChangeEvent,
  TextEditorVisibleRangesChangeEvent,
} from "@cursorless/common";
import type {
  Disposable,
  IDE,
  OpenUntitledTextDocumentOptions,
  RunMode,
  WorkspaceFolder,
} from "@cursorless/common";
import { pull } from "lodash";
import { v4 as uuid } from "uuid";
import { ExtensionContext } from "../../types/ExtensionContext";
import { NeovimCapabilities } from "./NeovimCapabilities";
import NeovimClipboard from "./NeovimClipboard";
import NeovimConfiguration from "./NeovimConfiguration";
import NeovimGlobalState from "./NeovimGlobalState";
import NeovimMessages from "./NeovimMessages";
import { NeovimTextEditorImpl } from "./NeovimTextEditorImpl";
import { neovimOnDidChangeTextDocument } from "./NeovimEvents";
import { Window } from "neovim";
import { InMemoryTextEditorImpl } from "./InMemoryTextEditorImpl";

export class NeovimIDE implements IDE {
  readonly configuration: NeovimConfiguration;
  readonly globalState: NeovimGlobalState;
  readonly messages: NeovimMessages;
  readonly clipboard: NeovimClipboard;
  readonly capabilities: NeovimCapabilities;
  public editorMap; // TODO: move to private?
  private activeWindow: Window | undefined;

  cursorlessVersion: string = "0.0.0";
  // runMode: RunMode = "production";
  runMode: RunMode = "development"; // enable debug logs
  // runMode: RunMode = "test";
  workspaceFolders: readonly WorkspaceFolder[] | undefined = undefined;
  private disposables: Disposable[] = [];
  private assetsRoot_: string | undefined;
  private quickPickReturnValue: string | undefined = undefined;

  constructor(private extensionContext: ExtensionContext) {
    this.configuration = new NeovimConfiguration();
    this.globalState = new NeovimGlobalState();
    this.messages = new NeovimMessages();
    this.clipboard = new NeovimClipboard();
    this.capabilities = new NeovimCapabilities();
    // this.editorMap = new Map<Window, NeovimTextEditorImpl>();
    this.editorMap = new Map<Window, InMemoryTextEditorImpl>();
    this.activeWindow = undefined;
  }

  async showQuickPick(
    _items: readonly string[],
    _options?: QuickPickOptions,
  ): Promise<string | undefined> {
    throw Error("XXX Not implemented");
  }

  async setHighlightRanges(
    _highlightId: string | undefined,
    _editor: TextEditor,
    _ranges: GeneralizedRange[],
  ): Promise<void> {
    throw Error("XXX Not implemented");
  }

  async flashRanges(_flashDescriptors: FlashDescriptor[]): Promise<void> {
    throw Error("XXX Not implemented");
  }

  get assetsRoot(): string {
    if (this.assetsRoot_ == null) {
      throw Error("Field `assetsRoot` has not yet been mocked");
    }

    return this.assetsRoot_;
  }

  get activeTextEditor(): TextEditor | undefined {
    // throw Error("activeTextEditor Not implemented");
    return this.getActiveTextEditor();
  }

  get activeEditableTextEditor(): EditableTextEditor | undefined {
    // throw Error("activeEditableTextEditor Not implemented");
    return this.getActiveTextEditor();
  }

  private getActiveTextEditor() {
    return this.activeWindow && this.editorMap.has(this.activeWindow)
      ? this.editorMap.get(this.activeWindow)
      : undefined;
  }

  get visibleTextEditors(): InMemoryTextEditorImpl[] {
    return Array.from(this.editorMap.values());
    // throw Error("visibleTextEditors Not implemented");
  }

  public getEditableTextEditor(editor: TextEditor): EditableTextEditor {
    return editor as EditableTextEditor;
    // throw Error("getEditableTextEditor Not implemented");
  }

  public findInDocument(_query: string, _editor: TextEditor): Promise<void> {
    throw Error("findInDocument Not implemented");
  }

  public findInWorkspace(_query: string): Promise<void> {
    throw Error("findInWorkspace Not implemented");
  }

  public openTextDocument(_path: string): Promise<TextEditor> {
    throw Error("openTextDocument Not implemented");
  }

  public openUntitledTextDocument(
    _options: OpenUntitledTextDocumentOptions,
  ): Promise<TextEditor> {
    throw Error("openUntitledTextDocument Not implemented");
  }

  public showInputBox(_options?: any): Promise<string | undefined> {
    throw Error("TextDocumentChangeEvent Not implemented");
  }

  executeCommand<T>(_command: string, ..._args: any[]): Promise<T | undefined> {
    throw new Error("executeCommand Method not implemented.");
  }

  onDidChangeTextDocument: Event<TextDocumentChangeEvent> = dummyEvent;
  // TODO: code below was tested successfully so can be reenabled when needed
  // public onDidChangeTextDocument(
  //   listener: (event: TextDocumentChangeEvent) => void,
  // ): Disposable {
  //   // console.warn("onDidChangeTextDocument Not implemented");
  //   // throw Error("onDidChangeTextDocument Not implemented");
  //   return neovimOnDidChangeTextDocument(listener);
  // }

  onDidOpenTextDocument: Event<TextDocument> = dummyEvent;
  onDidCloseTextDocument: Event<TextDocument> = dummyEvent;
  onDidChangeActiveTextEditor: Event<TextEditor | undefined> = dummyEvent;
  onDidChangeVisibleTextEditors: Event<TextEditor[]> = dummyEvent;
  onDidChangeTextEditorSelection: Event<TextEditorSelectionChangeEvent> =
    dummyEvent;
  onDidChangeTextEditorVisibleRanges: Event<TextEditorVisibleRangesChangeEvent> =
    dummyEvent;

  // public mockAssetsRoot(_assetsRoot: string) {
  //   this.assetsRoot_ = _assetsRoot;
  // }

  // public setQuickPickReturnValue(value: string | undefined) {
  //   this.quickPickReturnValue = value;
  // }

  // public fromNeovimEditor(editor: Window): NeovimTextEditorImpl {
  //   if (!this.editorMap.has(editor)) {
  //     const impl = new NeovimTextEditorImpl(uuid(), this, editor);
  //     impl.initialize();
  //     this.editorMap.set(editor, impl);
  //   }
  //   return this.editorMap.get(editor)!;
  // }

  fromNeovimEditor(
    editor: Window,
    bufferId: number,
    lines: string[],
  ): InMemoryTextEditorImpl {
    if (!this.editorMap.has(editor)) {
      this.toNeovimEditor(editor, bufferId, lines);
    }
    return this.editorMap.get(editor)!;
  }

  toNeovimEditor(editor: Window, bufferId: number, lines: string[]): void {
    this.activeWindow = editor;
    const impl = new InMemoryTextEditorImpl(
      uuid(),
      this,
      editor,
      bufferId,
      lines,
    );
    this.editorMap.set(editor, impl);
  }

  disposeOnExit(...disposables: Disposable[]): () => void {
    this.disposables.push(...disposables);

    return () => pull(this.disposables, ...disposables);
  }

  // exit(): void {
  //   this.disposables.forEach((disposable) => disposable.dispose());
  // }
}

function dummyEvent() {
  return {
    dispose() {
      // empty
    },
  };
}
