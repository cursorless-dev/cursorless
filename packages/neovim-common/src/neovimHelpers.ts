// Helper wrappers, generally around neovimApi.ts

import {
  bufferGetSelections,
  pasteFromClipboard,
  putToClipboard,
} from "@cursorless/neovim-common";
import { NeovimTextEditorImpl } from "./ide/neovim/NeovimTextEditorImpl";
import type { NeovimClient } from "neovim";
import { IDE } from "@cursorless/common";

export async function neovimClipboardCopy(
  client: NeovimClient,
  ide: IDE,
): Promise<void> {
  const editor = ide.activeTextEditor as NeovimTextEditorImpl;
  const window = await client.window;
  const selections = await bufferGetSelections(window, client);
  const data = editor.document.getText(selections[0]);
  await putToClipboard(data, client);
}

export async function neovimClipboardPaste(
  client: NeovimClient,
  ide: IDE,
): Promise<void> {
  await pasteFromClipboard(client);
}
