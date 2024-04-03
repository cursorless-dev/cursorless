import { NeovimTextDocumentImpl } from "../ide/neovim/NeovimTextDocumentImpl";
import { NeovimTextEditorImpl } from "../ide/neovim/NeovimTextEditorImpl";
import { updateTextEditor } from "../neovimHelpers";
import { neovimClient } from "../singletons/client.singleton";

interface NewEditorOptions {
  languageId?: string;
  openBeside?: boolean;
}

export async function openNewEditor(
  content: string,
  { languageId = "plaintext", openBeside = false }: NewEditorOptions = {},
): Promise<NeovimTextEditorImpl> {
  // standardise newlines so we can easily split the lines
  const newLines = content.replace(/(?:\r\n|\r|\n)/g, "\n").split("\n");

  const client = neovimClient();
  await client.command(":enew");

  const window = await client.window;

  // Replace old content with new content
  const buffer = await window.buffer;
  const oldLines = await buffer.lines;
  await buffer.setLines(newLines, {
    start: 0,
    end: oldLines.length,
    strictIndexing: false,
  });
  // const buffer = await window.buffer;
  // await buffer.setLines(newLines, { start: 0, end: 1, strictIndexing: false });

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
