import { Range } from "@cursorless/common";
import * as vscode from "vscode";
import { VscodeIDE } from "./VscodeIDE";
import { VscodeTextEditorImpl } from "./VscodeTextEditorImpl";

export async function vscodeFold(
  ide: VscodeIDE,
  editor: VscodeTextEditorImpl,
  ranges: Range[] | undefined,
): Promise<void> {
  return foldOrUnfold(ide, editor, ranges, "editor.fold");
}

export function vscodeUnfold(
  ide: VscodeIDE,
  editor: VscodeTextEditorImpl,
  ranges: Range[] | undefined,
): Promise<void> {
  return foldOrUnfold(ide, editor, ranges, "editor.unfold");
}

async function foldOrUnfold(
  ide: VscodeIDE,
  editor: VscodeTextEditorImpl,
  ranges: Range[] | undefined,
  command: "editor.fold" | "editor.unfold",
): Promise<void> {
  ranges = ranges ?? editor.selections;

  const singleLineRanges = ranges.filter((range) => range.isSingleLine);
  const multiLineRanges = ranges.filter((range) => !range.isSingleLine);

  // Don't mix multi and single line targets.
  // This is probably the result of an "every" command
  // and folding the single line targets will fold the parent as well
  ranges = multiLineRanges.length ? multiLineRanges : singleLineRanges;

  const originalEditor = ide.activeEditableTextEditor;

  // Necessary to focus editor for fold command to work
  if (originalEditor !== editor) {
    await editor.focus();
  }

  const lines = ranges.map((range) => range.start.line);

  await vscode.commands.executeCommand(command, {
    levels: 1,
    direction: "down",
    selectionLines: lines,
  });

  // If necessary focus back original editor
  if (originalEditor != null && originalEditor !== editor) {
    await originalEditor.focus();
  }
}
