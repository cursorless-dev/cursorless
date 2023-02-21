import * as vscode from "vscode";
import { RevealLineAt } from "@cursorless/common";
import { VscodeTextEditorImpl } from "./VscodeTextEditorImpl";

export async function vscodeRevealLine(
  editor: VscodeTextEditorImpl,
  lineNumber: number,
  at: RevealLineAt,
): Promise<void> {
  // For reveal line to the work we have to have the correct editor focused
  if (!editor.isActive) {
    await editor.focus();
  }

  await vscode.commands.executeCommand("revealLine", {
    lineNumber,
    at:
      at === RevealLineAt.top
        ? "top"
        : at === RevealLineAt.bottom
        ? "bottom"
        : "center",
  });
}
