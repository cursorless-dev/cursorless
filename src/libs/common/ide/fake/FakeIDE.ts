import { pull } from "lodash";
import type { TextDocumentChangeEvent } from "../types/Events";
import type {
  Disposable,
  IDE,
  RunMode,
  WorkspaceFolder,
} from "../types/ide.types";
import type { EditableTextEditor, TextEditor } from "../types/TextEditor";
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
  activeTextEditor: TextEditor | undefined = undefined;
  activeEditableTextEditor: EditableTextEditor | undefined = undefined;

  get visibleTextEditors(): TextEditor[] {
    return this.original?.visibleTextEditors ?? [];
  }

  public getEditableTextEditor(_editor: TextEditor): EditableTextEditor {
    throw Error("Not supported");
  }

  onDidChangeTextDocument(
    _listener: (event: TextDocumentChangeEvent) => void,
  ): Disposable {
    throw Error("Not supported");
  }

  disposeOnExit(...disposables: Disposable[]): () => void {
    this.disposables.push(...disposables);

    return () => pull(this.disposables, ...disposables);
  }

  exit(): void {
    this.disposables.forEach((disposable) => disposable.dispose());
  }
}
