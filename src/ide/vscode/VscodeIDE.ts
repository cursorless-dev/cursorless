import type { EditableTextEditor, TextEditor } from "@cursorless/common";
import { pull } from "lodash";
import { ExtensionContext, window, workspace, WorkspaceFolder } from "vscode";
import type { TextDocumentChangeEvent } from "../../libs/common/ide/types/Events";
import type {
  Disposable,
  IDE,
  RunMode,
} from "../../libs/common/ide/types/ide.types";
import { toVscodeEditor } from "@cursorless/vscode-common";
import VscodeClipboard from "./VscodeClipboard";
import VscodeConfiguration from "./VscodeConfiguration";
import { VscodeEditableTextEditorImpl } from "./VscodeEditableTextEditorImpl";
import { vscodeOnDidChangeTextDocument } from "./VscodeEvents";
import VscodeGlobalState from "./VscodeGlobalState";
import { fromVscodeEditor } from "./vscodeIdeUtil";
import VscodeMessages from "./VscodeMessages";
import { vscodeRunMode } from "./VscodeRunMode";

export default class VscodeIDE implements IDE {
  configuration: VscodeConfiguration;
  globalState: VscodeGlobalState;
  messages: VscodeMessages;
  clipboard: VscodeClipboard;

  constructor(private extensionContext: ExtensionContext) {
    this.configuration = new VscodeConfiguration(this);
    this.globalState = new VscodeGlobalState(extensionContext);
    this.messages = new VscodeMessages();
    this.clipboard = new VscodeClipboard();
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
    return window.activeTextEditor != null
      ? fromVscodeEditor(window.activeTextEditor)
      : undefined;
  }

  get activeEditableTextEditor(): EditableTextEditor | undefined {
    return window.activeTextEditor != null
      ? new VscodeEditableTextEditorImpl(window.activeTextEditor)
      : undefined;
  }

  get visibleTextEditors(): TextEditor[] {
    return window.visibleTextEditors.map(fromVscodeEditor);
  }

  public getEditableTextEditor(editor: TextEditor): EditableTextEditor {
    return new VscodeEditableTextEditorImpl(toVscodeEditor(editor));
  }

  public onDidChangeTextDocument(
    listener: (event: TextDocumentChangeEvent) => void,
  ): Disposable {
    return vscodeOnDidChangeTextDocument(listener);
  }

  disposeOnExit(...disposables: Disposable[]): () => void {
    this.extensionContext.subscriptions.push(...disposables);

    return () => pull(this.extensionContext.subscriptions, ...disposables);
  }
}
