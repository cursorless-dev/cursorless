// Helper wrappers, generally around neovimApi.ts

import {
  bufferGetSelections,
  getFromClipboard,
  putToClipboard,
} from "@cursorless/neovim-common";
import { NeovimTextEditorImpl } from "./ide/neovim/NeovimTextEditorImpl";
import type { NeovimClient } from "neovim";
import { IDE } from "@cursorless/common";

//TODO:  file a github issue to get notified about changes in buffer and drop code

/**
 * Subscribe to buffer updates, e.g. when the text changes.
 */
// TODO: we can make this function a method of NeovimIDE class
// TODO: delete this function as done as part of toNeovimEditor() now
// export async function subscribeBufferUpdates() {
//   const client = neovimClient();

//   const neovimIDE = getNeovimIDE();

//   /**
//    * "attach" to Nvim buffers to subscribe to buffer update events.
//    * This is similar to TextChanged but more powerful and granular.
//    *
//    * @see https://neovim.io/doc/user/api.html#nvim_buf_attach()
//    */
//   // const buffers = await client.buffers;
//   const buffers = [await client.buffer];
//   buffers.forEach((buf) => {
//     if (neovimIDE.getTextDocument(buf) !== undefined) {
//       console.log(`already listening for changes in buffer: ${buf.id}`);
//       return;
//     }
//     console.log(`listening for changes in buffer: ${buf.id}`);
//     buf.listen("lines", receivedBufferEvent);
//   });
// }

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
  const editor = ide.activeTextEditor as NeovimTextEditorImpl;
  const window = await client.window;
  const data = await getFromClipboard(client);
  // TODO: get the current selection indexes,
  // retrieve the corresponding lines from the Buffer,
  // and replace the lines with the pasted data
  // NO: just issue an insert (CTRL+V) in lua
}
