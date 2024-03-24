// Helper wrappers, generally around neovimApi.ts

import {
  bufferGetSelections,
  putToClipboard,
  windowGetVisibleRanges,
} from "./neovimApi";
import { neovimContext } from "./singletons/context.singleton";
import { ide } from "./singletons/ide.singleton";
import { receivedBufferEvent } from "./types/BufferManager";
import { NeovimTextEditorImpl } from "./ide/neovim/NeovimTextEditorImpl";
import { NeovimIDE } from "./ide/neovim/NeovimIDE";
import { SpyIDE } from "@cursorless/common";

/**
 * Initialize the current editor (and current document).
 * We always overwrite the current editor from scratch for now
 * because we reinitialize it for every command we receive
 *
 * TODO: We only initialize one editor(current window) with one document(current buffer)
 *       we need to support updating editors and documents on the fly
 */
export async function updateTextEditor(): Promise<NeovimTextEditorImpl> {
  const client = neovimContext().client;
  const window = await client.window;
  const buffer = await window.buffer;
  const lines = await buffer.lines;
  console.warn(`updateTextEditor(): lines=${lines}`);
  console.warn(
    `creating editor/document for window:${window.id} buffer:${buffer.id}`,
  );
  const selections = await bufferGetSelections(window, client);
  console.warn(
    `updateTextEditor(): selections=(${selections[0].start.line}, ${selections[0].start.character}), (${selections[0].end.line}, ${selections[0].end.character})`,
  );
  const visibleRanges = await windowGetVisibleRanges(window, client, lines);
  const ide_ = ide();
  let neovimIDE: NeovimIDE;
  if (ide_ instanceof NeovimIDE) {
    neovimIDE = ide_;
  } else if (ide_ instanceof SpyIDE) {
    neovimIDE = ide_.original as NeovimIDE;
  } else {
    throw Error("updateTextEditor(): ide() is not NeovimIDE");
  }
  return neovimIDE.toNeovimEditor(
    window,
    buffer.id,
    lines,
    visibleRanges,
    selections,
  );
}

/**
 * Subscribe to buffer updates, e.g. when the text changes.
 * TODO: keeping this code as it was previously tested and it works but need to see when it
 * will be useful (to update hats?)
 */
export async function subscribeBufferUpdates() {
  const client = neovimContext().client;

  // initialize the editor since it is needed before we can attach?
  await updateTextEditor();

  /**
   * "attach" to Nvim buffers to subscribe to buffer update events.
   * This is similar to TextChanged but more powerful and granular.
   *
   * @see https://neovim.io/doc/user/api.html#nvim_buf_attach()
   */
  const buffers = await client.buffers;
  buffers.forEach(
    /* async */ (buf) => {
      console.warn("listening for changes in buffer: ", buf.id);
      buf.listen("lines", receivedBufferEvent);
      // TODO: Exception has occurred: TypeError: buf[import_Buffer.ATTACH] is not a function
      // await buf[ATTACH](true);
    },
  );
}

export async function neovimClipboardCopy(): Promise<void> {
  const editor = ide().activeTextEditor as NeovimTextEditorImpl;
  const client = neovimContext().client;
  const window = await client.window;
  const selections = await bufferGetSelections(window, client);
  const data = editor.document.getText(selections[0]);
  await putToClipboard(data, client);
}
