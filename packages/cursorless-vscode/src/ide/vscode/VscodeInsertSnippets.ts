import * as vscode from "vscode";
import type { Range } from "@cursorless/common";
import type { VscodeTextEditorImpl } from "./VscodeTextEditorImpl";

export async function vscodeInsertSnippet(
  editor: VscodeTextEditorImpl,
  snippet: string,
  ranges: Range[] | undefined,
): Promise<void> {
  if (ranges != null) {
    await editor.setSelections(ranges.map((range) => range.toSelection(false)));
  }

  await editor.focus();

  // NB: We use the command "editor.action.insertSnippet" instead of calling editor.insertSnippet
  // because the latter doesn't support special variables like CLIPBOARD
  await vscode.commands.executeCommand("editor.action.insertSnippet", {
    snippet,
  });
}
