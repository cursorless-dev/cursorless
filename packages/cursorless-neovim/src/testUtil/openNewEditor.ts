import { NeovimTextDocumentImpl } from "../ide/neovim/NeovimTextDocumentImpl";
import { NeovimTextEditorImpl } from "../ide/neovim/NeovimTextEditorImpl";
import { updateTextEditor } from "../neovimHelpers";
import { neovimClient } from "../singletons/client.singleton";

interface NewEditorOptions {
  languageId?: string;
  openBeside?: boolean;
}

// NOTE: When the nvim-data/swap folder gets too big, neovim will start
// displaying a "press enter or type command to continue" message for every ":enew" command
// so the workaround is to delete that folder.
export async function openNewEditor(
  content: string,
  { languageId = "plaintext", openBeside = false }: NewEditorOptions = {},
): Promise<NeovimTextEditorImpl> {
  const client = neovimClient();
  // open a new buffer
  // @see: https://vi.stackexchange.com/questions/8345/a-built-in-way-to-make-vim-open-a-new-buffer-with-file
  await client.command(":enew");

  // standardise newlines so we can easily split the lines
  const newLines = content.replace(/(?:\r\n|\r|\n)/g, "\n").split("\n");

  // set the buffer contents
  const window = await client.window;
  const buffer = await window.buffer;
  await buffer.setLines(newLines, { start: 0, end: -1, strictIndexing: false });

  if (!openBeside) {
    // close all the other buffers
    // @see: https://stackoverflow.com/questions/4545275/vim-close-all-buffers-but-this-one
    await client.command(":BufOnly!");
  }

  // update our view of the document
  const editor = await updateTextEditor();

  return editor;
}

export async function reuseEditor(
  editor: NeovimTextDocumentImpl, // vscode.TextEditor,
  content: string,
  language: string = "plaintext",
) {
  throw new Error("reuseEditor() Not implemented");
}

/**
 * Open a new notebook editor with the given cells
 * @param cellContents A list of strings each of which will become the contents
 * of a cell in the notebook
 * @param language The language id to use for all the cells in the notebook
 * @returns notebook
 */
export async function openNewNotebookEditor(
  cellContents: string[],
  language: string = "plaintext",
) {
  throw new Error("openNewNotebookEditor() Not implemented");
}
