import { pull } from "lodash";
import {
  ExtensionContext,
  ExtensionMode,
  workspace,
  WorkspaceFolder,
} from "vscode";
import {
  Disposable,
  IDE,
  RunMode,
} from "../../libs/common/ide/types/ide.types";
import VscodeClipboard from "./VscodeClipboard";
import VscodeConfiguration from "./VscodeConfiguration";
import VscodeGlobalState from "./VscodeGlobalState";
import VscodeMessages from "./VscodeMessages";

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

  disposeOnExit(...disposables: Disposable[]): () => void {
    this.extensionContext.subscriptions.push(...disposables);

    return () => pull(this.extensionContext.subscriptions, ...disposables);
  }
}
