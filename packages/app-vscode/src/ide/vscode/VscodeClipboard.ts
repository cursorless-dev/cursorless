import * as vscode from "vscode";
import type { Clipboard } from "@cursorless/lib-common";

export class VscodeClipboard implements Clipboard {
  async readText(): Promise<string> {
    return await vscode.env.clipboard.readText();
  }

  async writeText(value: string): Promise<void> {
    return await vscode.env.clipboard.writeText(value);
  }
}
