import { TextDocument, window } from "vscode";

/**
 * Given a document corresponding to a single cell, retrieve the notebook
 * document for the entire notebook
 * @param document The document corresponding to the given cell
 * @returns The notebook document corresponding to the notebook containing the
 * given cell
 */
export function getNotebookFromCellDocument(document: TextDocument) {
  const { notebookEditor } =
    window.visibleNotebookEditors
      .flatMap((notebookEditor) =>
        notebookEditor.notebook.getCells().map((cell) => ({
          notebookEditor,
          cell,
        })),
      )
      .find(
        ({ cell }) => cell.document.uri.toString() === document.uri.toString(),
      ) ?? {};

  return notebookEditor;
}
