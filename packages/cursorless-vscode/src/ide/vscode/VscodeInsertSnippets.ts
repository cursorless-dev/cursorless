import * as vscode from "vscode";
import type { Range } from "@cursorless/common";
import type { VscodeTextEditorImpl } from "./VscodeTextEditorImpl";

export async function vscodeInsertSnippet(
  editor: VscodeTextEditorImpl,
  snippet: string,
  ranges: Range[] | undefined,
): Promise<void> {
  if (ranges != null) {
    editor.selections = ranges.map((range) => range.toSelection(false));
  }

  await editor.focus();
  await vscode.commands.executeCommand("editor.action.insertSnippet", {
    snippet,
  });
}
