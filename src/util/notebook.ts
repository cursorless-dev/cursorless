import { NotebookDocument, TextDocument } from "vscode";

export function getNotebookFromCellDocument(document: TextDocument) {
  return (document as any).notebook as NotebookDocument | undefined;
}

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
