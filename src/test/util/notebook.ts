import type * as vscode from "vscode";

export function getPlainNotebookContents(notebook: vscode.NotebookDocument) {
  return notebook.getCells().map((cell) => cell.document.getText());
}
