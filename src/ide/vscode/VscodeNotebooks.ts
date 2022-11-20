import * as vscode from "vscode";
import { getNotebookFromCellDocument } from "../../util/notebook";
import { VscodeTextEditorImpl } from "./VscodeTextEditorImpl";

export async function vscodeInsertNotebookCellAbove(
  editor: VscodeTextEditorImpl,
): Promise<boolean> {
  const isNotebook = isNotebookEditor(editor);

  const command = isNotebook
    ? "notebook.cell.insertCodeCellAbove"
    : "jupyter.insertCellAbove";

  await vscode.commands.executeCommand(command);

  return !isNotebook;
}

export async function vscodeInsertNotebookCellBelow(
  editor: VscodeTextEditorImpl,
): Promise<boolean> {
  const isNotebook = isNotebookEditor(editor);

  const command = isNotebook
    ? "notebook.cell.insertCodeCellBelow"
    : "jupyter.insertCellBelow";

  await vscode.commands.executeCommand(command);

  return !isNotebook;
}

function isNotebookEditor(editor: VscodeTextEditorImpl) {
  return getNotebookFromCellDocument(editor.vscodeEditor.document) != null;
}
