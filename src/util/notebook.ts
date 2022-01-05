import { NotebookDocument, TextDocument } from "vscode";

/**
 * Given a document corresponding to a single cell, retrieve the notebook
 * document for the entire notebook
 * @param document The document corresponding to the given cell
 * @returns The notebook document corresponding to the notebook containing the
 * given cell
 */
export function getNotebookFromCellDocument(document: TextDocument) {
  return (document as any).notebook as NotebookDocument | undefined;
}

/**
 * Returns the index of the cell corresponding to the given document in the
 * notebook. Assumes that the given notebook contains the given cell
 * @param editorNotebook The notebook document containing the cell
 * @param document The document corresponding to the given cell
 * @returns The index of the cell in the notebook
 */
export function getCellIndex(
  editorNotebook: NotebookDocument,
  document: TextDocument
) {
  return editorNotebook
    .getCells()
    .findIndex(
      (cell) => cell.document.uri.toString() === document.uri.toString()
    );
}
