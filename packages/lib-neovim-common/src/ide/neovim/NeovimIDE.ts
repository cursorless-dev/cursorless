import * as path from "node:path";
import { pull } from "lodash";
import type { Buffer, NeovimClient, Window } from "neovim";
import { v4 as uuid } from "uuid";
import { URI } from "vscode-uri";
import type {
  Disposable,
  EditableTextEditor,
  Event,
  FlashDescriptor,
  GeneralizedRange,
  IDE,
  NotebookEditor,
  OpenUntitledTextDocumentOptions,
  QuickPickOptions,
  Range,
  RunMode,
  Selection,
  TextDocument,
  TextDocumentChangeEvent,
  TextEditor,
  TextEditorSelectionChangeEvent,
  TextEditorVisibleRangesChangeEvent,
  WorkspaceFolder,
} from "@cursorless/lib-common";
import { getNeovimRegistry } from "@cursorless/lib-neovim-registry";
import { nodeGetRunMode } from "@cursorless/lib-node-common";
import {
  bufferGetSelections,
  getCursorlessNvimPath,
  showErrorMessage,
  windowGetVisibleRanges,
} from "../../neovimApi";
import { NeovimCapabilities } from "./NeovimCapabilities";
import NeovimClipboard from "./NeovimClipboard";
import NeovimConfiguration from "./NeovimConfiguration";
import {
  neovimOnDidChangeTextDocument,
  neovimOnDidOpenTextDocument,
} from "./NeovimEvents";
import NeovimKeyValueStore from "./NeovimKeyValueStore";
import NeovimMessages from "./NeovimMessages";
import { NeovimTextDocument } from "./NeovimTextDocument";
import { NeovimTextEditor } from "./NeovimTextEditor";

export class NeovimIDE implements IDE {
  readonly configuration: NeovimConfiguration;
  readonly keyValueStore: NeovimKeyValueStore;
  readonly messages: NeovimMessages;
  readonly clipboard: NeovimClipboard;
  readonly capabilities: NeovimCapabilities;
  private editorMap;
  private documentMap;
  private activeWindow: Window | undefined;
  private activeBuffer: Buffer | undefined;

  cursorlessVersion: string = "0.0.0";
  workspaceFolders: readonly WorkspaceFolder[] | undefined = undefined;
  private disposables: Disposable[] = [];
  private assetsRoot_: string | undefined;
  private cursorlessNeovimPath: string | undefined;
  private quickPickReturnValue: string | undefined = undefined;

  constructor(private client: NeovimClient) {
    this.configuration = new NeovimConfiguration();
    this.keyValueStore = new NeovimKeyValueStore();
    this.messages = new NeovimMessages();
    this.clipboard = new NeovimClipboard(this.client);
    this.capabilities = new NeovimCapabilities();
    this.editorMap = new Map<Window, NeovimTextEditor>();
    this.documentMap = new Map<Buffer, NeovimTextDocument>();
    this.activeWindow = undefined;
    this.activeBuffer = undefined;
  }

  async init() {
    const rootPath = await getCursorlessNvimPath(this.client);
    // we store the assets into a subfolder of cursorless.nvim
    this.assetsRoot_ = path.join(rootPath, "assets");
    this.cursorlessNeovimPath = path.join(
      rootPath,
      "node",
      "cursorless-neovim",
    );
  }

  async showQuickPick(
    _items: readonly string[],
    _options?: QuickPickOptions,
  ): Promise<string | undefined> {
    throw new Error("showQuickPick: not implemented");
  }

  async setHighlightRanges(
    _highlightId: string | undefined,
    _editor: TextEditor,
    _ranges: GeneralizedRange[],
  ): Promise<void> {
    throw new Error("setHighlightRanges: not implemented");
  }

  async flashRanges(_flashDescriptors: FlashDescriptor[]): Promise<void> {
    console.debug("flashRanges Not implemented");
  }

  get assetsRoot(): string {
    if (this.assetsRoot_ == null) {
      throw new Error("Field `assetsRoot` has not yet been mocked");
    }

    return this.assetsRoot_;
  }

  //
  get runMode(): RunMode {
    return nodeGetRunMode();
  }

  get activeTextEditor(): TextEditor | undefined {
    return this.getActiveTextEditor();
  }

  get activeEditableTextEditor(): EditableTextEditor | undefined {
    return this.getActiveTextEditor();
  }

  private getActiveTextEditor() {
    const editor = this.activeWindow
      ? this.getTextEditor(this.activeWindow)
      : undefined;
    if (editor === undefined) {
      console.debug("getActiveTextEditor: editor is undefined");
    }
    return editor;
  }

  private getTextEditor(w: Window) {
    for (const [window, textEditor] of this.editorMap) {
      if (window.id === w.id) {
        return textEditor;
      }
    }
    return undefined;
  }

  public getTextDocument(b: Buffer) {
    for (const [buffer, textDocument] of this.documentMap) {
      if (buffer.id === b.id) {
        return textDocument;
      }
    }
    return undefined;
  }

  get visibleTextEditors(): NeovimTextEditor[] {
    return Array.from(this.editorMap.values());
  }

  get visibleNotebookEditors(): NotebookEditor[] {
    return [];
  }

  public getEditableTextEditor(editor: TextEditor): EditableTextEditor {
    return editor as EditableTextEditor;
  }

  public async findInDocument(
    _query: string,
    _editor: TextEditor,
  ): Promise<void> {
    throw new Error("findInDocument: not implemented");
  }

  public async findInWorkspace(_query: string): Promise<void> {
    throw new Error("findInWorkspace: not implemented");
  }

  public async openTextDocument(_path: string): Promise<TextEditor> {
    throw new Error("openTextDocument: not implemented");
  }

  public async openUntitledTextDocument(
    _options: OpenUntitledTextDocumentOptions,
  ): Promise<TextEditor> {
    throw new Error("openUntitledTextDocument: not implemented");
  }

  public async showInputBox(_options?: any): Promise<string | undefined> {
    throw new Error("showInputBox: not implemented");
  }

  public async executeCommand<T>(
    _command: string,
    ..._args: any[]
  ): Promise<T | undefined> {
    throw new Error("executeCommand: not implemented");
  }

  public onDidChangeTextDocument(
    listener: (event: TextDocumentChangeEvent) => void,
  ): Disposable {
    return neovimOnDidChangeTextDocument(listener);
  }

  public onDidOpenTextDocument(
    listener: (event: TextDocument) => any,
    thisArgs?: any,
    disposables?: Disposable[],
  ): Disposable {
    return neovimOnDidOpenTextDocument(listener, thisArgs, disposables);
  }
  onDidCloseTextDocument: Event<TextDocument> = dummyEvent;
  onDidChangeActiveTextEditor: Event<TextEditor | undefined> = dummyEvent;
  onDidChangeVisibleTextEditors: Event<TextEditor[]> = dummyEvent;
  onDidChangeTextEditorSelection: Event<TextEditorSelectionChangeEvent> =
    dummyEvent;
  onDidChangeTextEditorVisibleRanges: Event<TextEditorVisibleRangesChangeEvent> =
    dummyEvent;

  /**
   * Initialize the current editor (and current document).
   * If the current editor already exists, it will only update the current document of that editor.
   *
   * when we receive our first cursorless command, we will initialize an editor an document for it.
   * for the following commands, we will only update the document.
   *
   * Atm, we only initialize one editor(current window) with one document(current buffer)
   */
  async updateTextEditor(minimal: boolean = false): Promise<NeovimTextEditor> {
    const window = await this.client.window;
    const buffer = await window.buffer;
    const lines = await buffer.lines;
    let linesShown = lines;
    if (lines.length >= 30) {
      linesShown = lines.slice(0, 15).concat(["..."]).concat(lines.slice(-15));
    }
    console.debug(
      `updateTextEditor(): window:${window.id}, buffer:${buffer.id}, lines=${JSON.stringify(linesShown)}`,
    );
    let selections: Selection[];
    let visibleRanges: Range[];
    if (!minimal) {
      selections = await bufferGetSelections(window, this.client);
      visibleRanges = await windowGetVisibleRanges(window, this.client, lines);
    } else {
      selections = [];
      visibleRanges = [];
    }
    const editor = this.toNeovimEditor(
      window,
      buffer,
      lines,
      visibleRanges,
      selections,
    );

    getNeovimRegistry().emitEvent("onDidOpenTextDocument", editor.document);

    return editor;
  }

  toNeovimEditor(
    window: Window,
    buffer: Buffer,
    lines: string[],
    visibleRanges: Range[],
    selections: Selection[],
  ): NeovimTextEditor {
    let document = this.getTextDocument(buffer);
    let editor = this.getTextEditor(window);
    if (!document) {
      console.debug(
        `toNeovimEditor(): creating new document: buffer=${buffer.id}`,
      );
      document = new NeovimTextDocument(
        URI.parse(`neovim://${buffer.id}`),
        "plaintext",
        1,
        "\n",
        lines,
      );
      this.documentMap.set(buffer, document);
    } else {
      console.debug(`toNeovimEditor(): updating document: buffer=${buffer.id}`);
      document.update(lines);
    }
    if (!editor) {
      console.debug(
        `toNeovimEditor(): creating new editor: window=${window.id}`,
      );
      editor = new NeovimTextEditor(
        uuid(),
        this.client,
        this,
        window,
        document,
        visibleRanges,
        selections,
      );
      this.editorMap.set(window, editor);
    } else {
      console.debug(`toNeovimEditor(): updating editor: window=${window.id}`);
      editor.updateDocument(visibleRanges, selections, document);
    }
    this.activeBuffer = buffer;
    this.activeWindow = window;

    return this.activeTextEditor as NeovimTextEditor;
  }

  handleCommandError(err: Error) {
    void showErrorMessage(this.client, err.message);
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
