import type { NeovimClient } from "neovim";
import { NeovimIDE } from "../ide/neovim/NeovimIDE";
import { NeovimTextDocumentImpl } from "../ide/neovim/NeovimTextDocumentImpl";
import { NeovimTextEditorImpl } from "../ide/neovim/NeovimTextEditorImpl";

interface NewEditorOptions {
  languageId?: string;
  openBeside?: boolean;
}

// NOTE: When the nvim-data/swap folder gets too big, neovim will start
// displaying a "press enter or type command to continue" message for every ":enew" command
// so the workaround is to delete that folder.
export async function openNewEditor(
  client: NeovimClient,
  neovimIDE: NeovimIDE,
  content: string,
  { languageId = "plaintext", openBeside = false }: NewEditorOptions = {},
): Promise<NeovimTextEditorImpl> {
  // open a new buffer
  // @see: https://vi.stackexchange.com/questions/8345/a-built-in-way-to-make-vim-open-a-new-buffer-with-file
  // XXX - this is where it hangs atm after the first command back into lua
  // NOTE: if I comment this, it hangs at the ":BufOnly!" command below
  await client.command(":enew");

  if (!openBeside) {
    // close all the other buffers
    // @see: https://stackoverflow.com/questions/4545275/vim-close-all-buffers-but-this-one
    await client.command(":BufOnly!");
  }

  // standardise newlines so we can easily split the lines
  const newLines = content.replace(/(?:\r\n|\r|\n)/g, "\n").split("\n");

  // set the buffer contents
  const window = await client.window;
  const buffer = await window.buffer;
  await buffer.setLines(newLines, { start: 0, end: -1, strictIndexing: false });

  // Not sure it matters but we try to set the right end of line type
  const eol = content.includes("\r\n") ? "CRLF" : "LF";
  // https://stackoverflow.com/questions/82726/convert-dos-windows-line-endings-to-linux-line-endings-in-vim
  if (eol === "CRLF") {
    await client.command(":set ff=dos");
  } else {
    await client.command(":set ff=unix");
  }

  const editor = await neovimIDE.updateTextEditor();

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
