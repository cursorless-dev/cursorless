import { Selection } from "@cursorless/common";
import * as vscode from "vscode";
import { getNotebookFromCellDocument } from "./notebook/notebook";
import { VscodeTextEditorImpl } from "./VscodeTextEditorImpl";

export async function vscodeEditNewNotebookCellAbove(
  editor: VscodeTextEditorImpl,
): Promise<(selection: Selection) => Selection> {
  const isNotebook = isNotebookEditor(editor);

  const command = isNotebook
    ? "notebook.cell.insertCodeCellAbove"
    : "jupyter.insertCellAbove";

  await vscode.commands.executeCommand(command);

  // This is a horrible hack to work around the fact that in vscode the promise
  // resolves before the edits have actually been performed.  This lambda will
  // be applied to the selection of the that mark to pretend like the edit has
  // been performed and moved the that mark down accordingly.
  return isNotebook
    ? (selection) => selection
    : (selection) =>
        new Selection(
          selection.anchor.translate(2, undefined),
          selection.active.translate(2, undefined),
        );
}

export async function vscodeEditNewNotebookCellBelow(
  editor: VscodeTextEditorImpl,
): Promise<void> {
  const isNotebook = isNotebookEditor(editor);

  const command = isNotebook
    ? "notebook.cell.insertCodeCellBelow"
    : "jupyter.insertCellBelow";

  await vscode.commands.executeCommand(command);
}

function isNotebookEditor(editor: VscodeTextEditorImpl) {
  return getNotebookFromCellDocument(editor.vscodeEditor.document) != null;
}
