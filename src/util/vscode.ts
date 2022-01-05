import { NotebookDocument, TextDocument } from "vscode";

export function getNotebookFromCellDocument(document: TextDocument) {
  return (document as any).notebook as NotebookDocument | undefined;
}
