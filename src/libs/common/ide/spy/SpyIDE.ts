import { pickBy, values } from "lodash";
import type { Clipboard } from "../types/Clipboard";
import type { Configuration } from "../types/Configuration";
import type { TextDocumentChangeEvent } from "../types/Events";
import type {
  Disposable,
  IDE,
  RunMode,
  WorkspaceFolder,
} from "../types/ide.types";
import type { State } from "../types/State";
import { EditableTextEditor, TextEditor } from "../types/TextEditor";
import SpyMessages, { Message } from "./SpyMessages";

export interface SpyIDERecordedValues {
  messages?: Message[];
}

export default class SpyIDE implements IDE {
  configuration: Configuration;
  globalState: State;
  clipboard: Clipboard;
  messages: SpyMessages;

  constructor(private original: IDE) {
    this.configuration = original.configuration;
    this.globalState = original.globalState;
    this.clipboard = original.clipboard;
    this.messages = new SpyMessages(original.messages);
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

  getSpyValues(): SpyIDERecordedValues | undefined {
    const ret = {
      messages: this.messages.getSpyValues(),
    };

    return values(ret).every((value) => value == null)
      ? undefined
      : pickBy(ret, (value) => value != null);
  }
}
