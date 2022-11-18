import type {
  Capabilities,
  EditableTextEditor,
  InputBoxOptions,
  TextEditor,
} from "@cursorless/common";
import { pull } from "lodash";
import type { TextDocumentChangeEvent } from "../types/Events";
import type {
  Disposable,
  IDE,
  RunMode,
  WorkspaceFolder,
} from "../types/ide.types";
import FakeClipboard from "./FakeClipboard";
import FakeConfiguration from "./FakeConfiguration";
import FakeGlobalState from "./FakeGlobalState";
import FakeMessages from "./FakeMessages";

export default class FakeIDE implements IDE {
  configuration: FakeConfiguration;
  messages: FakeMessages;
  globalState: FakeGlobalState;
  clipboard: FakeClipboard;
  private disposables: Disposable[] = [];

  constructor(private original?: IDE) {
    this.configuration = new FakeConfiguration();
    this.messages = new FakeMessages();
    this.globalState = new FakeGlobalState();
    this.clipboard = new FakeClipboard();
  }

  private assetsRoot_: string | undefined;

  mockAssetsRoot(_assetsRoot: string) {
    this.assetsRoot_ = _assetsRoot;
  }

  get assetsRoot(): string {
    if (this.assetsRoot_ == null) {
      throw Error("Field `assetsRoot` has not yet been mocked");
    }

    return this.assetsRoot_;
  }

  runMode: RunMode = "test";
  workspaceFolders: readonly WorkspaceFolder[] | undefined = undefined;

  get activeTextEditor(): TextEditor | undefined {
    return this.original?.activeTextEditor;
  }

  get activeEditableTextEditor(): EditableTextEditor | undefined {
    return this.original?.activeEditableTextEditor;
  }

  get visibleTextEditors(): TextEditor[] {
    return this.original?.visibleTextEditors ?? [];
  }

  get capabilities(): Capabilities {
    if (this.original == null) {
      throw Error("Original ide is missing");
    }
    return this.original.capabilities;
  }

  public findInWorkspace(query: string): Promise<void> {
    if (this.original == null) {
      throw Error("Original ide is missing");
    }
    return this.original.findInWorkspace(query);
  }

  public getEditableTextEditor(editor: TextEditor): EditableTextEditor {
    if (this.original == null) {
      throw Error("Original ide is missing");
    }
    return this.original.getEditableTextEditor(editor);
  }

  public async openTextDocument(path: string): Promise<void> {
    if (this.original == null) {
      throw Error("Original ide is missing");
    }
    return this.original.openTextDocument(path);
  }

  public async showInputBox(
    options?: InputBoxOptions,
  ): Promise<string | undefined> {
    if (this.original == null) {
      throw Error("Original ide is missing");
    }
    return this.original.showInputBox(options);
  }

  public onDidChangeTextDocument(
    listener: (event: TextDocumentChangeEvent) => void,
  ): Disposable {
    if (this.original == null) {
      throw Error("Original ide is missing");
    }
    return this.original.onDidChangeTextDocument(listener);
  }

  disposeOnExit(...disposables: Disposable[]): () => void {
    this.disposables.push(...disposables);

    return () => pull(this.disposables, ...disposables);
  }

  exit(): void {
    this.disposables.forEach((disposable) => disposable.dispose());
  }
}
