import type {
  EditableTextEditor,
  Range,
  Selection,
  TextEditor,
} from "@cursorless/common";
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
import { Window } from "neovim";
import { NeovimTextEditorImpl } from "./NeovimTextEditorImpl";
import { NeovimExtensionContext } from "./NeovimExtensionContext";
import { getTalonNvimPath } from "../../neovimApi";
import path from "path";
import { neovimOnDidChangeTextDocument } from "./NeovimEvents";

export class NeovimIDE implements IDE {
  readonly configuration: NeovimConfiguration;
  readonly globalState: NeovimGlobalState;
  readonly messages: NeovimMessages;
  readonly clipboard: NeovimClipboard;
  readonly capabilities: NeovimCapabilities;
  public editorMap; // TODO: move to private? Should be possible right away?
  private activeWindow: Window | undefined;

  cursorlessVersion: string = "0.0.0";
  // TODO: how can we support changing the runMode dynamically?
  // See https://code.visualstudio.com/api/references/vscode-api#ExtensionMode
  // runMode: RunMode = "production"; // use for end user
  runMode: RunMode = "development"; // use to enable debug logs or for fixture tests
  // runMode: RunMode = "test"; // what is it used for?
  workspaceFolders: readonly WorkspaceFolder[] | undefined = undefined;
  private disposables: Disposable[] = [];
  private assetsRoot_: string | undefined;
  private cursorlessNeovimPath: string | undefined;
  private quickPickReturnValue: string | undefined = undefined;

  constructor(private extensionContext: ExtensionContext) {
    this.configuration = new NeovimConfiguration();
    this.globalState = new NeovimGlobalState();
    this.messages = new NeovimMessages();
    this.clipboard = new NeovimClipboard();
    this.capabilities = new NeovimCapabilities();
    this.editorMap = new Map<Window, NeovimTextEditorImpl>();
    this.activeWindow = undefined;
  }

  async init() {
    const client = (this.extensionContext as NeovimExtensionContext).client;
    const talonNvimPath = await getTalonNvimPath(client);
    // talon-nvim path: C:\Users\User\AppData\Local\nvim-data\lazy\talon.nvim
    // we store the assets into a subfolder of talon.nvim
    this.assetsRoot_ = path.join(talonNvimPath, "assets");
    // development cursorless-neovim path: C:\Users\User\AppData\Local\nvim\rplugin\node\cursorless-neovim
    // TODO: we will need to change this once all the files are in talon.nvim/
    this.cursorlessNeovimPath = path.join(
      talonNvimPath,
      "..",
      "..",
      "..",
      "nvim",
      "rplugin",
      "node",
      "cursorless-neovim",
    );
  }

  async showQuickPick(
    _items: readonly string[],
    _options?: QuickPickOptions,
  ): Promise<string | undefined> {
    throw Error("showQuickPick Not implemented");
  }

  async setHighlightRanges(
    _highlightId: string | undefined,
    _editor: TextEditor,
    _ranges: GeneralizedRange[],
  ): Promise<void> {
    throw Error("setHighlightRanges Not implemented");
  }

  async flashRanges(_flashDescriptors: FlashDescriptor[]): Promise<void> {
    // TODO: find how to flash the target ranges (similar to vscode)
    // we know we can do that with a "yank" vim operation but we want to do it for any cursorless operation
    /* e.g. "bring row one" gives:
      at NeovimIDE.<anonymous> (cursorless-neovim\out\index.cjs:44601:13)
      at Generator.next (<anonymous>)
      at cursorless-neovim\out\index.cjs:63:61
      at new Promise (<anonymous>)
      at __async (cursorless-neovim\out\index.cjs:47:10)
      at NeovimIDE.flashRanges (cursorless-neovim\out\index.cjs:44600:12)
      at NormalizedIDE.flashRanges (cursorless-neovim\out\index.cjs:22910:26)
      at NormalizedIDE.flashRanges (cursorless-neovim\out\index.cjs:23611:79)
      at flashTargets (cursorless-neovim\out\index.cjs:38187:15)
      at Bring.decorateTargets (cursorless-neovim\out\index.cjs:38318:7)
    */
    // TODO: it is not mandatory to implement for now so we can just log a warning
    console.warn("flashRanges Not implemented");
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
    const editor =
      this.activeWindow && this.editorMap.has(this.activeWindow)
        ? this.editorMap.get(this.activeWindow)
        : undefined;
    if (editor === undefined) {
      console.warn("getActiveTextEditor: editor is undefined");
    }
    return editor;
  }

  get visibleTextEditors(): NeovimTextEditorImpl[] {
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

  // onDidChangeTextDocument: Event<TextDocumentChangeEvent> = dummyEvent;
  public onDidChangeTextDocument(
    listener: (event: TextDocumentChangeEvent) => void,
  ): Disposable {
    // console.warn("onDidChangeTextDocument Not implemented");
    // throw Error("onDidChangeTextDocument Not implemented");
    return neovimOnDidChangeTextDocument(listener);
  }

  onDidOpenTextDocument: Event<TextDocument> = dummyEvent;
  onDidCloseTextDocument: Event<TextDocument> = dummyEvent;
  onDidChangeActiveTextEditor: Event<TextEditor | undefined> = dummyEvent;
  onDidChangeVisibleTextEditors: Event<TextEditor[]> = dummyEvent;
  onDidChangeTextEditorSelection: Event<TextEditorSelectionChangeEvent> =
    dummyEvent;
  onDidChangeTextEditorVisibleRanges: Event<TextEditorVisibleRangesChangeEvent> =
    dummyEvent;

  fromNeovimEditor(
    editor: Window,
    bufferId: number,
    lines: string[],
    visibleRanges: Range[],
    selections: Selection[],
  ): NeovimTextEditorImpl {
    if (!this.editorMap.has(editor)) {
      this.toNeovimEditor(editor, bufferId, lines, visibleRanges, selections);
    }
    return this.editorMap.get(editor)!;
  }

  toNeovimEditor(
    editor: Window,
    bufferId: number,
    lines: string[],
    visibleRanges: Range[],
    selections: Selection[],
  ): NeovimTextEditorImpl {
    if (
      this.activeWindow &&
      this.editorMap.has(this.activeWindow) &&
      this.activeWindow.id === editor.id
    ) {
      console.warn(
        "toNeovimEditor(): editor already exists, updating its document",
      );
      const activeEditor = this.activeTextEditor as NeovimTextEditorImpl;
      activeEditor.initDocument(bufferId, lines, visibleRanges, selections);
      return activeEditor;
    }

    console.warn("toNeovimEditor(): creating new editor/document");
    this.activeWindow = editor;
    const impl = new NeovimTextEditorImpl(
      uuid(),
      this,
      editor,
      bufferId,
      lines,
      visibleRanges,
      selections,
    );
    this.editorMap.set(editor, impl);
    return impl;
  }

  disposeOnExit(...disposables: Disposable[]): () => void {
    this.disposables.push(...disposables);

    return () => pull(this.disposables, ...disposables);
  }
}

function dummyEvent() {
  return {
    dispose() {
      // empty
    },
  };
}
