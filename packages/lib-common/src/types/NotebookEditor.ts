import type { URI } from "vscode-uri";
import type { NotebookCell } from "./NotebookCell";

export interface NotebookEditor {
  /**
   * The associated uri for this document.
   *
   * *Note* that most documents use the `file`-scheme, which means they are files on disk. However, **not** all documents are
   * saved on disk and therefore the `scheme` must be checked before trying to access the underlying file or siblings on disk.
   */
  readonly uri: URI;

  /**
   * The number of cells in the notebook.
   */
  readonly cellCount: number;

  /**
   * The cells of this notebook.
   */
  readonly cells: NotebookCell[];
}
