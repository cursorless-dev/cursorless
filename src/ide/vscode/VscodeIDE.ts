import type { EditableTextEditor, TextEditor } from "@cursorless/common";
import { pull } from "lodash";
import * as vscode from "vscode";
import { ExtensionContext, window, workspace, WorkspaceFolder } from "vscode";
import type { TextDocumentChangeEvent } from "../../libs/common/ide/types/Events";
import type {
  Disposable,
  IDE,
  RunMode,
} from "../../libs/common/ide/types/ide.types";
import VscodeClipboard from "./VscodeClipboard";
import VscodeConfiguration from "./VscodeConfiguration";
import { VscodeTextEditorImpl } from "./VscodeTextEditorImpl";
import { vscodeOnDidChangeTextDocument } from "./VscodeEvents";
import VscodeGlobalState from "./VscodeGlobalState";
import VscodeMessages from "./VscodeMessages";
import { vscodeRunMode } from "./VscodeRunMode";
import { v4 as uuid } from "uuid";

export default class VscodeIDE implements IDE {
  configuration: VscodeConfiguration;
  globalState: VscodeGlobalState;
  messages: VscodeMessages;
  clipboard: VscodeClipboard;
  private editorMap;

  constructor(private extensionContext: ExtensionContext) {
    this.configuration = new VscodeConfiguration(this);
    this.globalState = new VscodeGlobalState(extensionContext);
    this.messages = new VscodeMessages();
    this.clipboard = new VscodeClipboard();
    this.editorMap = new WeakMap<vscode.TextEditor, VscodeTextEditorImpl>();
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

  public async openTextDocument(path: string): Promise<void> {
    const textDocument = await workspace.openTextDocument(path);
    await window.showTextDocument(textDocument);
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
