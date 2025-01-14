import type { GeneralizedRange } from "../types/GeneralizedRange";
import type { TextDocument } from "../types/TextDocument";
import type { EditableTextEditor, TextEditor } from "../types/TextEditor";
import type { Capabilities } from "./types/Capabilities";
import type { Clipboard } from "./types/Clipboard";
import type { Configuration } from "./types/Configuration";
import type { TextDocumentChangeEvent } from "./types/Events";
import type {
  TextEditorSelectionChangeEvent,
  TextEditorVisibleRangesChangeEvent,
} from "./types/events.types";
import type { FlashDescriptor } from "./types/FlashDescriptor";
import type {
  Disposable,
  IDE,
  OpenUntitledTextDocumentOptions,
  RunMode,
  WorkspaceFolder,
} from "./types/ide.types";
import type { Messages } from "./types/Messages";
import type { QuickPickOptions } from "./types/QuickPickOptions";
import type { KeyValueStore } from "./types/KeyValueStore";

export default class PassthroughIDEBase implements IDE {
  configuration: Configuration;
  keyValueStore: KeyValueStore;
  clipboard: Clipboard;
  messages: Messages;
  capabilities: Capabilities;

  constructor(private original: IDE) {
    this.configuration = original.configuration;
    this.keyValueStore = original.keyValueStore;
    this.clipboard = original.clipboard;
    this.messages = original.messages;
    this.capabilities = original.capabilities;
  }

  flashRanges(flashDescriptors: FlashDescriptor[]): Promise<void> {
    return this.original.flashRanges(flashDescriptors);
  }

  setHighlightRanges(
    highlightId: string | undefined,
    editor: TextEditor,
    ranges: GeneralizedRange[],
  ): Promise<void> {
    return this.original.setHighlightRanges(highlightId, editor, ranges);
  }

  onDidOpenTextDocument(
    listener: (e: TextDocument) => any,
    thisArgs?: any,
    disposables?: Disposable[],
  ): Disposable {
    return this.original.onDidOpenTextDocument(listener, thisArgs, disposables);
  }
  onDidCloseTextDocument(
    listener: (e: TextDocument) => any,
    thisArgs?: any,
    disposables?: Disposable[],
  ): Disposable {
    return this.original.onDidCloseTextDocument(
      listener,
      thisArgs,
      disposables,
    );
  }
  onDidChangeActiveTextEditor(
    listener: (e: TextEditor | undefined) => any,
    thisArgs?: any,
    disposables?: Disposable[],
  ): Disposable {
    return this.original.onDidChangeActiveTextEditor(
      listener,
      thisArgs,
      disposables,
    );
  }
  onDidChangeVisibleTextEditors(
    listener: (e: TextEditor[]) => any,
    thisArgs?: any,
    disposables?: Disposable[],
  ): Disposable {
    return this.original.onDidChangeVisibleTextEditors(
      listener,
      thisArgs,
      disposables,
    );
  }
  onDidChangeTextEditorSelection(
    listener: (e: TextEditorSelectionChangeEvent) => any,
    thisArgs?: any,
    disposables?: Disposable[],
  ): Disposable {
    return this.original.onDidChangeTextEditorSelection(
      listener,
      thisArgs,
      disposables,
    );
  }
  onDidChangeTextEditorVisibleRanges(
    listener: (e: TextEditorVisibleRangesChangeEvent) => any,
    thisArgs?: any,
    disposables?: Disposable[],
  ): Disposable {
    return this.original.onDidChangeTextEditorVisibleRanges(
      listener,
      thisArgs,
      disposables,
    );
  }

  public get activeTextEditor(): TextEditor | undefined {
    return this.original.activeTextEditor;
  }

  public get activeEditableTextEditor(): EditableTextEditor | undefined {
    return this.original.activeEditableTextEditor;
  }

  public get visibleTextEditors(): TextEditor[] {
    return this.original.visibleTextEditors;
  }

  public get cursorlessVersion(): string {
    return this.original.cursorlessVersion;
  }

  public get assetsRoot(): string {
    return this.original.assetsRoot;
  }

  public get runMode(): RunMode {
    return this.original.runMode;
  }

  public get workspaceFolders(): readonly WorkspaceFolder[] | undefined {
    return this.original.workspaceFolders;
  }

  public findInDocument(query: string, editor?: TextEditor): Promise<void> {
    return this.original.findInDocument(query, editor);
  }

  public findInWorkspace(query: string): Promise<void> {
    return this.original.findInWorkspace(query);
  }

  public openTextDocument(path: string): Promise<TextEditor> {
    return this.original.openTextDocument(path);
  }

  public openUntitledTextDocument(
    options?: OpenUntitledTextDocumentOptions,
  ): Promise<TextEditor> {
    return this.original.openUntitledTextDocument(options);
  }

  public showQuickPick(
    items: readonly string[],
    options?: QuickPickOptions,
  ): Promise<string | undefined> {
    return this.original.showQuickPick(items, options);
  }

  public showInputBox(options?: any): Promise<string | undefined> {
    return this.original.showInputBox(options);
  }

  public getEditableTextEditor(editor: TextEditor): EditableTextEditor {
    return this.original.getEditableTextEditor(editor);
  }

  executeCommand<T>(command: string, ...args: any[]): Promise<T | undefined> {
    return this.original.executeCommand(command, ...args);
  }

  public onDidChangeTextDocument(
    listener: (event: TextDocumentChangeEvent) => void,
  ): Disposable {
    return this.original.onDidChangeTextDocument(listener);
  }

  disposeOnExit(...disposables: Disposable[]): () => void {
    return this.original.disposeOnExit(...disposables);
  }
}
