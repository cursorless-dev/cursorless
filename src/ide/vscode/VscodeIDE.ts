import type {
  EditableTextEditor,
  InputBoxOptions,
  TextEditor,
} from "@cursorless/common";
import { pull } from "lodash";
import { v4 as uuid } from "uuid";
import * as vscode from "vscode";
import { ExtensionContext, window, workspace, WorkspaceFolder } from "vscode";
import type { TextDocumentChangeEvent } from "../../libs/common/ide/types/Events";
import type {
  Disposable,
  IDE,
  RunMode,
} from "../../libs/common/ide/types/ide.types";
import { VscodeCapabilities } from "./VscodeCapabilities";
import VscodeClipboard from "./VscodeClipboard";
import VscodeConfiguration from "./VscodeConfiguration";
import { vscodeOnDidChangeTextDocument } from "./VscodeEvents";
import VscodeGlobalState from "./VscodeGlobalState";
import { VscodeHats } from "./VscodeHats";
import VscodeMessages from "./VscodeMessages";
import { vscodeRunMode } from "./VscodeRunMode";
import { VscodeTextEditorImpl } from "./VscodeTextEditorImpl";

export default class VscodeIDE implements IDE {
  readonly configuration: VscodeConfiguration;
  readonly globalState: VscodeGlobalState;
  readonly messages: VscodeMessages;
  readonly clipboard: VscodeClipboard;
  readonly capabilities: VscodeCapabilities;
  readonly hats: VscodeHats;
  private editorMap;

  constructor(private extensionContext: ExtensionContext) {
    this.configuration = new VscodeConfiguration(this);
    this.globalState = new VscodeGlobalState(extensionContext);
    this.messages = new VscodeMessages();
    this.clipboard = new VscodeClipboard();
    this.capabilities = new VscodeCapabilities();
    this.hats = new VscodeHats(this, extensionContext);
    this.editorMap = new WeakMap<vscode.TextEditor, VscodeTextEditorImpl>();
  }

  async init() {
    await this.hats.init();
  }

  get assetsRoot(): string {
    return this.extensionContext.extensionPath;
  }

  get runMode(): RunMode {
    return vscodeRunMode(this.extensionContext);
  }

  get workspaceFolders(): readonly WorkspaceFolder[] | undefined {
    return workspace.workspaceFolders;
  }

  get activeTextEditor(): TextEditor | undefined {
    return this.getActiveTextEditor();
  }

  get activeEditableTextEditor(): EditableTextEditor | undefined {
    return this.getActiveTextEditor();
  }

  private getActiveTextEditor() {
    return window.activeTextEditor != null
      ? this.fromVscodeEditor(window.activeTextEditor)
      : undefined;
  }

  get visibleTextEditors(): TextEditor[] {
    return window.visibleTextEditors.map((e) => this.fromVscodeEditor(e));
  }

  public getEditableTextEditor(editor: TextEditor): EditableTextEditor {
    return editor as EditableTextEditor;
  }

  public async findInWorkspace(query: string): Promise<void> {
    await vscode.commands.executeCommand("workbench.action.findInFiles", {
      query,
    });
  }

  public async openTextDocument(path: string): Promise<TextEditor> {
    const textDocument = await workspace.openTextDocument(path);
    return this.fromVscodeEditor(await window.showTextDocument(textDocument));
  }

  public async showInputBox(
    options?: InputBoxOptions,
  ): Promise<string | undefined> {
    return await vscode.window.showInputBox(options);
  }

  public async executeCommand<T>(
    command: string,
    ...args: any[]
  ): Promise<T | undefined> {
    return await vscode.commands.executeCommand(command, ...args);
  }

  public onDidChangeTextDocument(
    listener: (event: TextDocumentChangeEvent) => void,
  ): Disposable {
    return vscodeOnDidChangeTextDocument(listener);
  }

  public fromVscodeEditor(editor: vscode.TextEditor): VscodeTextEditorImpl {
    if (!this.editorMap.has(editor)) {
      this.editorMap.set(
        editor,
        new VscodeTextEditorImpl(uuid(), this, editor),
      );
    }
    return this.editorMap.get(editor)!;
  }

  disposeOnExit(...disposables: Disposable[]): () => void {
    this.extensionContext.subscriptions.push(...disposables);

    return () => pull(this.extensionContext.subscriptions, ...disposables);
  }
}
