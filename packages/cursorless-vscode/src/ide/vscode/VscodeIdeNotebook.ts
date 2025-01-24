import type {
  NotebookCell,
  NotebookCellKind,
  NotebookEditor,
  TextDocument,
} from "@cursorless/common";
import type * as vscode from "vscode";
import type { URI } from "vscode-uri";
import { VscodeTextDocumentImpl } from "./VscodeTextDocumentImpl";

export class VscodeNotebookEditorImpl implements NotebookEditor {
  private notebook: vscode.NotebookDocument;

  constructor(editor: vscode.NotebookEditor) {
    this.notebook = editor.notebook;
  }

  get uri(): URI {
    return this.notebook.uri;
  }

  get cellCount(): number {
    return this.notebook.cellCount;
  }

  get cells(): NotebookCell[] {
    return this.notebook
      .getCells()
      .map((cell) => new VscodeNotebookCellImpl(cell));
  }
}

export class VscodeNotebookCellImpl implements NotebookCell {
  private cell: vscode.NotebookCell;

  constructor(cell: vscode.NotebookCell) {
    this.cell = cell;
  }

  get index(): number {
    return this.cell.index;
  }

  get kind(): NotebookCellKind {
    return this.cell.kind;
  }

  get document(): TextDocument {
    return new VscodeTextDocumentImpl(this.cell.document);
  }
}
