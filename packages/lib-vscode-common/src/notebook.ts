import type { NotebookDocument, TextDocument } from "vscode";

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
) {
  return notebookDocument
    .getCells()
    .findIndex(
      (cell) => cell.document.uri.toString() === document.uri.toString(),
    );
}
