import { EditableTextEditor, TextEditor } from "../types/TextEditor";
import { Clipboard } from "./types/Clipboard";
import { Configuration } from "./types/Configuration";
import { TextDocumentChangeEvent } from "./types/Events";
import { Disposable, IDE, RunMode, WorkspaceFolder } from "./types/ide.types";
import { Messages } from "./types/Messages";
import { State } from "./types/State";

export default class PassthroughIDEBase implements IDE {
  configuration: Configuration;
  globalState: State;
  clipboard: Clipboard;
  messages: Messages;

  constructor(private original: IDE) {
    this.configuration = original.configuration;
    this.globalState = original.globalState;
    this.clipboard = original.clipboard;
    this.messages = original.messages;
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

  public get assetsRoot(): string {
    return this.original.assetsRoot;
  }

  public get runMode(): RunMode {
    return this.original.runMode;
  }

  public get workspaceFolders(): readonly WorkspaceFolder[] | undefined {
    return this.original.workspaceFolders;
  }

  public getEditableTextEditor(editor: TextEditor): EditableTextEditor {
    return this.original.getEditableTextEditor(editor);
  }

  onDidChangeTextDocument(
    listener: (event: TextDocumentChangeEvent) => void,
  ): Disposable {
    return this.original.onDidChangeTextDocument(listener);
  }

  disposeOnExit(...disposables: Disposable[]): () => void {
    return this.original.disposeOnExit(...disposables);
  }
}
