import type {
  Disposable,
  EditableTextEditor,
  IDE,
  OpenUntitledTextDocumentOptions,
  Range,
  RunMode,
  Selection,
  TextDocumentChangeEvent,
  TextEditor,
  WorkspaceFolder,
} from "@cursorless/common";
import type {
  Event,
  FlashDescriptor,
  GeneralizedRange,
  QuickPickOptions,
  TextDocument,
  TextEditorSelectionChangeEvent,
  TextEditorVisibleRangesChangeEvent,
} from "@cursorless/common";
import { pull } from "lodash";
// import type { Buffer, JetbrainsClient, Window } from "jetbrains";
// import { v4 as uuid } from "uuid";
import { JetbrainsCapabilities } from "./JetbrainsCapabilities";
// import JetbrainsClipboard from "./JetbrainsClipboard";
// import JetbrainsConfiguration from "./JetbrainsConfiguration";
// import JetbrainsKeyValueStore from "./JetbrainsKeyValueStore";
// import JetbrainsMessages from "./JetbrainsMessages";
// import { JetbrainsTextEditorImpl } from "./JetbrainsTextEditorImpl";
// import path from "path";
// import { nodeGetRunMode } from "@cursorless/node-common";

import {
  jetbrainsOnDidChangeTextDocument,
  jetbrainsOnDidOpenTextDocument,
} from "./JetbrainsEvents";

import { JetbrainsClient } from "./JetbrainsClient"
import { JetbrainsClipboard } from "./JetbrainsClipboard"
import { JetbrainsConfiguration } from "./JetbrainsConfiguration"
import { JetbrainsMessages } from "./JetbrainsMessages"
import { JetbrainsKeyValueStore } from "./JetbrainsKeyValueStore"

export class JetbrainsIDE implements IDE {
  readonly configuration: JetbrainsConfiguration;
  readonly keyValueStore: JetbrainsKeyValueStore;
  readonly messages: JetbrainsMessages;
  readonly clipboard: JetbrainsClipboard;
  readonly capabilities: JetbrainsCapabilities;
//   private editorMap;
//   private documentMap;
  private activeWindow: Window | undefined;
  private activeBuffer: Buffer | undefined;

  cursorlessVersion: string = "0.0.0";
  workspaceFolders: readonly WorkspaceFolder[] | undefined = undefined;
  private disposables: Disposable[] = [];
  private assetsRoot_: string | undefined;
  private cursorlessJetbrainsPath: string | undefined;
  private quickPickReturnValue: string | undefined = undefined;

  constructor(private client: JetbrainsClient) {
    this.configuration = new JetbrainsConfiguration();
    this.keyValueStore = new JetbrainsKeyValueStore();
    this.messages = new JetbrainsMessages();
    this.clipboard = new JetbrainsClipboard(this.client);
    this.capabilities = new JetbrainsCapabilities();
//     this.editorMap = new Map<Window, JetbrainsTextEditorImpl>();
//     this.documentMap = new Map<Buffer, JetbrainsTextDocumentImpl>();
    this.activeWindow = undefined;
    this.activeBuffer = undefined;
  }

  async init() {
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
    console.debug("flashRanges Not implemented");
  }

  get assetsRoot(): string {
    if (this.assetsRoot_ == null) {
      throw Error("Field `assetsRoot` has not yet been mocked");
    }

    return this.assetsRoot_;
  }

  //
  get runMode(): RunMode {
    return "production";
  }

  get activeTextEditor(): TextEditor | undefined {
    throw Error("activeTextEditor Not implemented");
//     return this.getActiveTextEditor();
  }

  get activeEditableTextEditor(): EditableTextEditor | undefined {
    throw Error("activeEditableTextEditor Not implemented");
//     return this.getActiveTextEditor();
  }



  get visibleTextEditors(): EditableTextEditor[] {
//     return Array.from(this.editorMap.values());
    throw Error("visibleTextEditors Not implemented");
  }

  public getEditableTextEditor(editor: TextEditor): EditableTextEditor {
//     return editor as EditableTextEditor;
    throw Error("getEditableTextEditor Not implemented");
  }

  public async findInDocument(
    _query: string,
    _editor: TextEditor,
  ): Promise<void> {
    throw Error("findInDocument Not implemented");
  }

  public async findInWorkspace(_query: string): Promise<void> {
    throw Error("findInWorkspace Not implemented");
  }

  public async openTextDocument(_path: string): Promise<TextEditor> {
    throw Error("openTextDocument Not implemented");
  }

  public async openUntitledTextDocument(
    _options: OpenUntitledTextDocumentOptions,
  ): Promise<TextEditor> {
    throw Error("openUntitledTextDocument Not implemented");
  }

  public async showInputBox(_options?: any): Promise<string | undefined> {
    throw Error("TextDocumentChangeEvent Not implemented");
  }

  public async executeCommand<T>(
    _command: string,
    ..._args: any[]
  ): Promise<T | undefined> {
    throw new Error("executeCommand Method not implemented.");
  }

  public onDidChangeTextDocument(
    listener: (event: TextDocumentChangeEvent) => void,
  ): Disposable {
    return jetbrainsOnDidChangeTextDocument(listener);
  }

  public onDidOpenTextDocument(
    listener: (event: TextDocument) => any,
    thisArgs?: any,
    disposables?: Disposable[] | undefined,
  ): Disposable {
    return jetbrainsOnDidOpenTextDocument(listener, thisArgs, disposables);
  }
  onDidCloseTextDocument: Event<TextDocument> = dummyEvent;
  onDidChangeActiveTextEditor: Event<TextEditor | undefined> = dummyEvent;
  onDidChangeVisibleTextEditors: Event<TextEditor[]> = dummyEvent;
  onDidChangeTextEditorSelection: Event<TextEditorSelectionChangeEvent> =
    dummyEvent;
  onDidChangeTextEditorVisibleRanges: Event<TextEditorVisibleRangesChangeEvent> =
    dummyEvent;

  handleCommandError(err: Error) {
    // if (err instanceof OutdatedExtensionError) {
    //   this.showUpdateExtensionErrorMessage(err);
    // } else {
//     void showErrorMessage(this.client, err.message);
    // }
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
