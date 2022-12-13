import type { EditableTextEditor, TextEditor } from "@cursorless/common";
import { pull } from "lodash";
import { Capabilities } from "../types/Capabilities";
import type { TextDocumentChangeEvent } from "../types/Events";
import type {
  Disposable,
  IDE,
  RunMode,
  WorkspaceFolder,
} from "../types/ide.types";
import { FakeCapabilities } from "./FakeCapabilities";
import FakeClipboard from "./FakeClipboard";
import FakeConfiguration from "./FakeConfiguration";
import FakeGlobalState from "./FakeGlobalState";
import FakeMessages from "./FakeMessages";

export default class FakeIDE implements IDE {
  configuration: FakeConfiguration;
  messages: FakeMessages;
  globalState: FakeGlobalState;
  clipboard: FakeClipboard;
  capabilities: Capabilities;
  runMode: RunMode = "test";
  workspaceFolders: readonly WorkspaceFolder[] | undefined = undefined;
  private disposables: Disposable[] = [];
  private assetsRoot_: string | undefined;

  constructor() {
    this.configuration = new FakeConfiguration();
    this.messages = new FakeMessages();
    this.globalState = new FakeGlobalState();
    this.clipboard = new FakeClipboard();
    this.capabilities = new FakeCapabilities();
  }

  public mockAssetsRoot(_assetsRoot: string) {
    this.assetsRoot_ = _assetsRoot;
  }

  get assetsRoot(): string {
    if (this.assetsRoot_ == null) {
      throw Error("Field `assetsRoot` has not yet been mocked");
    }

    return this.assetsRoot_;
  }

  get activeTextEditor(): TextEditor | undefined {
    throw Error("Not implemented");
  }

  get activeEditableTextEditor(): EditableTextEditor | undefined {
    throw Error("Not implemented");
  }

  get visibleTextEditors(): TextEditor[] {
    throw Error("Not implemented");
  }

  public getEditableTextEditor(_editor: TextEditor): EditableTextEditor {
    throw Error("Not implemented");
  }

  public findInWorkspace(_query: string): Promise<void> {
    throw Error("Not implemented");
  }

  public openTextDocument(_path: string): Promise<TextEditor> {
    throw Error("Not implemented");
  }

  public showInputBox(_options?: any): Promise<string | undefined> {
    throw Error("Not implemented");
  }

  executeCommand<T>(_command: string, ..._args: any[]): Promise<T | undefined> {
    throw new Error("Method not implemented.");
  }

  public onDidChangeTextDocument(
    _listener: (event: TextDocumentChangeEvent) => void,
  ): Disposable {
    throw Error("Not implemented");
  }

  disposeOnExit(...disposables: Disposable[]): () => void {
    this.disposables.push(...disposables);

    return () => pull(this.disposables, ...disposables);
  }

  exit(): void {
    this.disposables.forEach((disposable) => disposable.dispose());
  }
}
