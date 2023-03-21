import * as vscode from "vscode";
import { Clipboard } from "@cursorless/common";

export default class VscodeClipboard implements Clipboard {
  async readText(): Promise<string> {
    return await vscode.env.clipboard.readText();
  }

  async writeText(value: string): Promise<void> {
    return await vscode.env.clipboard.writeText(value);
  }
}
