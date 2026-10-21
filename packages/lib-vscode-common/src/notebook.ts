import type { NotebookDocument, NotebookEditor, TextDocument } from "vscode";
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
 * Given a document corresponding to a single cell, retrieve the notebook
 * editor for the entire notebook
 * @param document The document corresponding to the given cell
 * @returns The notebook editor corresponding to the notebook containing the
 * given cell
 */
export function getNotebookFromCellDocument(
  document: TextDocument,
): NotebookEditor {
  const editor = window.visibleNotebookEditors.find((editor) =>
    editor.notebook
      .getCells()
      .some((cell) => cell.document.uri.toString() === document.uri.toString()),
  );

  if (editor == null) {
    throw new Error("Couldn't find notebook editor for given document");
  }

  return editor;
}
