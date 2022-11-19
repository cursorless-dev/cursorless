import type { EditableTextEditor, TextEditor } from "@cursorless/common";
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

  constructor() {
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

  onDidChangeTextDocument(
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
