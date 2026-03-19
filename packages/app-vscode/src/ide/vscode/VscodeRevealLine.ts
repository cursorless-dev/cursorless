import * as vscode from "vscode";
import { RevealLineAt } from "@cursorless/common";
import type { VscodeTextEditor } from "./VscodeTextEditor";

export async function vscodeRevealLine(
  editor: VscodeTextEditor,
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
