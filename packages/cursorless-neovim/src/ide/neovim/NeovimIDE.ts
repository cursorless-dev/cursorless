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
import { NeovimCapabilities } from "./NeovimCapabilities";
import NeovimClipboard from "./NeovimClipboard";
import NeovimConfiguration from "./NeovimConfiguration";
import NeovimGlobalState from "./NeovimGlobalState";
import NeovimMessages from "./NeovimMessages";
import { NeovimClient, Window, Buffer } from "neovim";
import { NeovimTextEditorImpl } from "./NeovimTextEditorImpl";
import { getTalonNvimPath } from "../../neovimApi";
import path from "path";
import {
  neovimOnDidChangeTextDocument,
  neovimOnDidOpenTextDocument,
} from "./NeovimEvents";
import { NeovimTextDocumentImpl } from "./NeovimTextDocumentImpl";
import { URI } from "vscode-uri";

export class NeovimIDE implements IDE {
  readonly configuration: NeovimConfiguration;
  readonly globalState: NeovimGlobalState;
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
    this.globalState = new NeovimGlobalState();
    this.messages = new NeovimMessages();
    this.clipboard = new NeovimClipboard();
    this.capabilities = new NeovimCapabilities();
    this.editorMap = new Map<Window, NeovimTextEditorImpl>();
    this.documentMap = new Map<Buffer, NeovimTextDocumentImpl>();
    this.activeWindow = undefined;
    this.activeBuffer = undefined;
  }

  async init() {
    const talonNvimPath = await getTalonNvimPath(this.client);
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

  // See https://code.visualstudio.com/api/references/vscode-api#ExtensionMode
  get runMode(): RunMode {
    const runMode = process.env.CURSORLESS_MODE;
    const ret =
      runMode == null
        ? "production"
        : runMode === "test"
          ? "test"
          : runMode == "development"
            ? "development"
            : "unknown";
    if (ret === "unknown") {
      throw Error("Invalid runMode");
    }
    return ret;
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
    // TODO: find out how to flash the target ranges (similar to vscode)
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
    const editor = this.activeWindow
      ? this.getTextEditor(this.activeWindow)
      : undefined;
    if (editor === undefined) {
      console.warn("getActiveTextEditor: editor is undefined");
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

  // TODO: change to private once not needed anymore outside
  public getTextDocument(b: Buffer) {
    for (const [buffer, textDocument] of this.documentMap) {
      if (buffer.id === b.id) {
        return textDocument;
      }
    }
    return undefined;
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
    return neovimOnDidChangeTextDocument(listener);
  }

  // onDidOpenTextDocument: Event<TextDocument> = dummyEvent;
  public onDidOpenTextDocument(
    listener: (event: TextDocument) => any,
    thisArgs?: any,
    disposables?: Disposable[] | undefined,
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

  toNeovimEditor(
    window: Window,
    buffer: Buffer,
    lines: string[],
    visibleRanges: Range[],
    selections: Selection[],
  ): NeovimTextEditorImpl {
    let document = this.getTextDocument(buffer);
    let editor = this.getTextEditor(window);
    if (!document) {
      console.warn(
        `toNeovimEditor(): creating new document: buffer=${buffer.id}`,
      );
      document = new NeovimTextDocumentImpl(
        URI.parse(`neovim://${buffer.id}`), // URI.parse(`file://${buffer.id}`),
        "plaintext",
        1,
        "\n",
        // "\r\n",
        lines,
      );
      this.documentMap.set(buffer, document);

      // Subscribe to buffer updates, e.g. when the text changes.
      // "attach" to Nvim buffers to subscribe to buffer update events.
      // This is similar to TextChanged but more powerful and granular.
      // @see https://neovim.io/doc/user/api.html#nvim_buf_attach()
      // console.warn(
      //   `toNeovimEditor(): listening for changes in buffer: ${buffer.id}`,
      // );
      // buffer.listen("lines", async () => await receivedBufferEvent);
      // TODO: attempt to enforce that the rangeUpdater has the initial document state but not fixing fixture breakJustThis problem
      // receivedBufferEvent(buffer, 0, 0, lines.length, lines, false);
      // TODO: attempt to enforce that the rangeUpdater has an empty initial document but not fixing fixture breakJustThis problem
      // eventEmitter.emit("onDidChangeTextDocument", {
      //   document: document,
      //   contentChanges: [],
      // });
      // buffer.listen("lines", receivedBufferEvent);
    } else {
      console.warn(`toNeovimEditor(): updating document: buffer=${buffer.id}`);
      document.update(lines);
    }
    if (!editor) {
      console.warn(
        `toNeovimEditor(): creating new editor: window=${window.id}`,
      );
      editor = new NeovimTextEditorImpl(
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
      console.warn(`toNeovimEditor(): updating editor: window=${window.id}`);
      editor.updateDocument(visibleRanges, selections, document);
    }
    this.activeBuffer = buffer;
    this.activeWindow = window;

    return this.activeTextEditor as NeovimTextEditorImpl;
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
