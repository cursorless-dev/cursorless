import * as vscode from "vscode";
import { Clipboard } from "../../libs/common/ide/types/Clipboard";

export default class VscodeClipboard implements Clipboard {
  readText(): Thenable<string> {
    return vscode.env.clipboard.readText();
  }

  writeText(value: string): Thenable<void> {
    return vscode.env.clipboard.writeText(value);
  }
}
