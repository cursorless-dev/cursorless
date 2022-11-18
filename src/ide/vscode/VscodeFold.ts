import * as vscode from "vscode";
import VscodeIDE from "./VscodeIDE";
import { VscodeTextEditorImpl } from "./VscodeTextEditorImpl";

export async function vscodeFold(
  ide: VscodeIDE,
  editor: VscodeTextEditorImpl,
  lineNumbers: number[] | undefined,
  isFold: boolean,
): Promise<void> {
  const command = isFold ? "editor.fold" : "editor.unfold";
  const originalEditor = ide.activeEditableTextEditor;

  // Necessary to focus editor for fold command to work
  if (originalEditor !== editor) {
    await editor.focus();
  }

  const selectionLines =
    lineNumbers ?? editor.selections.map((selection) => selection.start.line);

  await vscode.commands.executeCommand(command, {
    levels: 1,
    direction: "down",
    selectionLines,
  });

  // If necessary focus back original editor
  if (originalEditor != null && originalEditor !== editor) {
    await originalEditor.focus();
  }
}
