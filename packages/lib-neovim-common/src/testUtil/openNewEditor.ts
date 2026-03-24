import type { NeovimTextEditor } from "..";
import type { NeovimTextDocument } from "../ide/neovim/NeovimTextDocument";

export interface NewEditorOptions {
  languageId?: string;
  openBeside?: boolean;
}

export async function openNewEditor(
  _content: string,
  _NewEditorOptions = {},
): Promise<NeovimTextEditor> {
  throw new Error("openNewEditor() Not implemented");
}

export async function reuseEditor(
  _editor: NeovimTextDocument, // vscode.TextEditor,
  _content: string,
  _language: string = "plaintext",
) {
  throw new Error("reuseEditor() Not implemented");
}

/**
 * Open a new notebook editor with the given cells
 * @param cellContents A list of strings each of which will become the contents
 * of a cell in the notebook
 * @param _language The language id to use for all the cells in the notebook
 * @returns notebook
 */
export async function openNewNotebookEditor(
  _cellContents: string[],
  _language: string = "plaintext",
) {
  throw new Error("openNewNotebookEditor() Not implemented");
}
