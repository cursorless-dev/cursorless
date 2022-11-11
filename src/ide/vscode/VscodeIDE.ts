import { pull } from "lodash";
import {
  ExtensionContext,
  ExtensionMode,
  window,
  workspace,
  WorkspaceFolder,
} from "vscode";
import {
  Disposable,
  IDE,
  RunMode,
} from "../../libs/common/ide/types/ide.types";
import type {
  EditableTextEditor,
  TextEditor,
} from "../../libs/common/ide/types/TextEditor";
import VscodeClipboard from "./VscodeClipboard";
import VscodeConfiguration from "./VscodeConfiguration";
import VscodeEditableTextEditorImpl from "./VscodeEditableTextEditorImpl";
import VscodeGlobalState from "./VscodeGlobalState";
import VscodeMessages from "./VscodeMessages";
import VscodeTextEditorImpl from "./VscodeTextEditorImpl";

const EXTENSION_MODE_MAP: Record<ExtensionMode, RunMode> = {
  [ExtensionMode.Development]: "development",
  [ExtensionMode.Production]: "production",
  [ExtensionMode.Test]: "test",
};

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
    return EXTENSION_MODE_MAP[this.extensionContext.extensionMode];
  }

  get workspaceFolders(): readonly WorkspaceFolder[] | undefined {
    return workspace.workspaceFolders;
  }

  get activeTextEditor(): TextEditor | undefined {
    return window.activeTextEditor != null
      ? new VscodeTextEditorImpl(window.activeTextEditor)
      : undefined;
  }

  get activeEditableTextEditor(): EditableTextEditor | undefined {
    return window.activeTextEditor != null
      ? new VscodeEditableTextEditorImpl(window.activeTextEditor)
      : undefined;
  }

  public getEditableTextEditor(editor: TextEditor): EditableTextEditor {
    return new VscodeEditableTextEditorImpl(
      (editor as VscodeTextEditorImpl).editor,
    );
  }

  disposeOnExit(...disposables: Disposable[]): () => void {
    this.extensionContext.subscriptions.push(...disposables);

    return () => pull(this.extensionContext.subscriptions, ...disposables);
  }
}
