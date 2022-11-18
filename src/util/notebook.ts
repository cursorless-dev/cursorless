import { NotebookCell, TextDocument, window } from "vscode";
import {
  getNotebookFromCellDocumentLegacy,
  isVscodeLegacyNotebookVersion,
} from "./notebookLegacy";

/**
 * Given a document corresponding to a single cell, retrieve the notebook
 * document for the entire notebook
 * @param document The document corresponding to the given cell
 * @returns The notebook document corresponding to the notebook containing the
 * given cell
 */
export function getNotebookFromCellDocument(document: TextDocument) {
  if (isVscodeLegacyNotebookVersion()) {
    return getNotebookFromCellDocumentLegacy(document);
  }

  // FIXME: All these type casts are necessary because we've pinned VSCode
  // version type defs.  Can remove them once we are using more recent type defs
  const { notebookEditor } =
    ((window as any).visibleNotebookEditors as any[])
      .flatMap((notebookEditor: any) =>
        (
          (
            notebookEditor.document ?? notebookEditor.notebook
          ).getCells() as NotebookCell[]
        ).map((cell) => ({
          notebookEditor,
          cell,
        })),
      )
      .find(
        ({ cell }) => cell.document.uri.toString() === document.uri.toString(),
      ) ?? {};

  return notebookEditor;
}
