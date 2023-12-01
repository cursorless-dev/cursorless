import { NotebookCell, TextDocument, window } from "vscode";

/** Gets the notebook containing a text document using >1.68.0 VSCode notebook api **/
export function getNotebookFromCellDocumentCurrent(document: TextDocument) {
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
