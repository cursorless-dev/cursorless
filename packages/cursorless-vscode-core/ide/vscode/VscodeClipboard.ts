import * as vscode from "vscode";
import { Clipboard } from "@cursorless/common";

export default class VscodeClipboard implements Clipboard {
  readText(): Thenable<string> {
    return vscode.env.clipboard.readText();
  }

  writeText(value: string): Thenable<void> {
    return vscode.env.clipboard.writeText(value);
  }
}
