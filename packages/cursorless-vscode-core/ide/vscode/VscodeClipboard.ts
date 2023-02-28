import * as vscode from "vscode";
import { Clipboard } from "@cursorless/common";

export default class VscodeClipboard implements Clipboard {
  readText(): Promise<string> {
    return vscode.env.clipboard.readText();
  }

  writeText(value: string): Promise<void> {
    return vscode.env.clipboard.writeText(value);
  }
}
