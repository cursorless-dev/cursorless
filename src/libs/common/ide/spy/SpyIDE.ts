import { pickBy, values } from "lodash";
import type {
  Disposable,
  IDE,
  RunMode,
  WorkspaceFolder,
} from "../types/ide.types";
import type { Configuration } from "../types/Configuration";
import type { State } from "../types/State";
import SpyMessages, { Message } from "./SpyMessages";
import type { Clipboard } from "../types/Clipboard";
import { TextEditor } from "../types/TextEditor";

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

  public get assetsRoot(): string {
    return this.original.assetsRoot;
  }

  public get runMode(): RunMode {
    return this.original.runMode;
  }

  public get workspaceFolders(): readonly WorkspaceFolder[] | undefined {
    return this.original.workspaceFolders;
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
