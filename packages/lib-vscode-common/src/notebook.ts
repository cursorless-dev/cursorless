import type {
  NotebookDocument,
  NotebookEditor,
  TextDocument,
  TextEditor,
} from "vscode";
import { window } from "vscode";

/**
 * Checks if the given document corresponds to a notebook cell
 * @param document The document to check
 * @returns True if the document corresponds to a notebook cell, false otherwise
 */
export function isDocumentNotebookCell(document: TextDocument) {
  return document.uri.scheme === "vscode-notebook-cell";
}

/**
 * Returns the index of the cell corresponding to the given document in the
 * notebook. Assumes that the given notebook contains the given cell
 * @param notebookDocument The notebook document containing the cell
 * @param document The document corresponding to the given cell
 * @returns The index of the cell in the notebook
 */

export function getCellIndex(
  notebookDocument: NotebookDocument,
  document: TextDocument,
): number {
  const index = notebookDocument
    .getCells()
    .findIndex(
      (cell) => cell.document.uri.toString() === document.uri.toString(),
    );

  if (index === -1) {
    throw new Error(
      "Couldn't find cell corresponding to given document in notebook editor",
    );
  }

  return index;
}

/**
 * Retrieve the notebook editor containing a cell editor. Reject ambiguous
 * split notebook targets when VS Code doesn't expose their owning editor.
 * @param cellEditor The text editor corresponding to the given cell
 * @returns The notebook editor corresponding to the notebook containing the
 * given cell
 */
export function getNotebookFromCellEditor(
  cellEditor: TextEditor,
): NotebookEditor {
  const uri = cellEditor.document.uri.toString();
  const editors = window.visibleNotebookEditors.filter((editor) =>
    editor.notebook
      .getCells()
      .some((cell) => cell.document.uri.toString() === uri),
  );

  if (editors.length === 0) {
    throw new Error("Couldn't find notebook editor for given document");
  }

  if (editors.length === 1) {
    return editors[0];
  }

  if (cellEditor.viewColumn != null) {
    const editor = editors.find(
      (editor) => editor.viewColumn === cellEditor.viewColumn,
    );
    if (editor != null) {
      return editor;
    }
  }

  const activeNotebookEditor = window.activeNotebookEditor;
  if (
    cellEditor === window.activeTextEditor &&
    activeNotebookEditor != null &&
    editors.includes(activeNotebookEditor)
  ) {
    return activeNotebookEditor;
  }

  throw new Error(
    "Targeting this cell in a split notebook is unsupported because VS Code doesn't expose which notebook editor contains it.",
  );
}
