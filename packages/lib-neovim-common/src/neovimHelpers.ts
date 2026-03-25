// Helper wrappers, generally around neovimApi.ts

import type { NeovimClient } from "neovim";
import type { IDE } from "@cursorless/lib-common";
import {
  bufferGetSelections,
  pasteFromClipboard,
  setClipboard,
} from "@cursorless/lib-neovim-common";
import type { NeovimTextEditor } from "./ide/neovim/NeovimTextEditor";

export async function neovimClipboardCopy(
  client: NeovimClient,
  ide: IDE,
): Promise<void> {
  const editor = ide.activeTextEditor as NeovimTextEditor;
  const window = await client.window;
  const selections = await bufferGetSelections(window, client);
  const data = editor.document.getText(selections[0]);
  await setClipboard(data, client);
}

export async function neovimClipboardPaste(
  client: NeovimClient,
  _ide: IDE,
): Promise<void> {
  await pasteFromClipboard(client);
}
