import type { TextDocument } from "./TextDocument";

export interface NotebookCell {
  /**
   * The index of this cell in its containing notebook. The
   * index is updated when a cell is moved within its notebook. The index is `-1`
   * when the cell has been removed from its notebook.
   */
  readonly index: number;

  /**
   * The kind of this cell.
   */
  readonly kind: NotebookCellKind;

  /**
   * The {@link TextDocument} of this cell.
   */
  readonly document: TextDocument;
}

export enum NotebookCellKind {
  /**
   * A markup-cell is formatted source that is used for display.
   */
  Markup = 1,

  /**
   * A code-cell.
   */
  Code = 2,
}
