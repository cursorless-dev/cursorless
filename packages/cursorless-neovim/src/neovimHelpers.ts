// Helper wrappers, generally around neovimApi.ts

import {
  bufferGetSelections,
  getFromClipboard,
  putToClipboard,
  windowGetVisibleRanges,
} from "./neovimApi";
import { neovimClient } from "./singletons/client.singleton";
import { ide } from "@cursorless/cursorless-engine";
// import { receivedBufferEvent } from "./types/BufferManager";
import { NeovimTextEditorImpl } from "./ide/neovim/NeovimTextEditorImpl";
import { NeovimIDE } from "./ide/neovim/NeovimIDE";
import { NormalizedIDE, SpyIDE } from "@cursorless/common";
import { receivedBufferEvent } from "./ide/neovim/NeovimEvents";
import { eventEmitter } from "./events";

// DEP-INJ: Delete this function. Is there a clean way to do it? Yes once we support pure dependency injection
export function getNeovimIDE(): NeovimIDE {
  const ide_ = ide();
  let neovimIDE: NeovimIDE;
  if (ide_ instanceof NeovimIDE) {
    neovimIDE = ide_;
  } else if (ide_ instanceof NormalizedIDE) {
    neovimIDE = ide_.original as NeovimIDE;
  } else if (ide_ instanceof SpyIDE) {
    const normalizedIDE = ide_.original as NormalizedIDE;
    neovimIDE = normalizedIDE.original as NeovimIDE;
  } else {
    throw Error("updateTextEditor(): ide() is not NeovimIDE");
  }
  return neovimIDE;
}

/**
 * Initialize the current editor (and current document).
 * If the current editor already exists, it will only update the current document of that editor.
 *
 * when we receive our first cursorless command, we will initialize an editor an document for it.
 * for the following commands, we will only update the document.
 *
 * Atm, we only initialize one editor(current window) with one document(current buffer)
 */
// TODO: we can make this function a method of NeovimIDE class
export async function updateTextEditor(): Promise<NeovimTextEditorImpl> {
  const client = neovimClient();
  const window = await client.window;
  const buffer = await window.buffer;
  const lines = await buffer.lines;
  console.warn(
    `updateTextEditor(): window:${window.id}, buffer:${buffer.id}, lines=${JSON.stringify(lines)}`,
  );
  const selections = await bufferGetSelections(window, client);
  const visibleRanges = await windowGetVisibleRanges(window, client, lines);
  const neovimIDE = getNeovimIDE();
  const editor = neovimIDE.toNeovimEditor(
    window,
    buffer,
    lines,
    visibleRanges,
    selections,
  );
  // await subscribeBufferUpdates();

  // TODO: simulate that the document is open for now from here.
  // we would need to ideally do it from neovim itself
  eventEmitter.emit("onDidOpenTextDocument", editor.document);

  return editor;
}

/**
 * Subscribe to buffer updates, e.g. when the text changes.
 */
// TODO: we can make this function a method of NeovimIDE class
// TODO: delete this function as done as part of toNeovimEditor() now
export async function subscribeBufferUpdates() {
  const client = neovimClient();

  const neovimIDE = getNeovimIDE();

  /**
   * "attach" to Nvim buffers to subscribe to buffer update events.
   * This is similar to TextChanged but more powerful and granular.
   *
   * @see https://neovim.io/doc/user/api.html#nvim_buf_attach()
   */
  // const buffers = await client.buffers;
  const buffers = [await client.buffer];
  buffers.forEach((buf) => {
    if (neovimIDE.getTextDocument(buf) !== undefined) {
      console.warn(`already listening for changes in buffer: ${buf.id}`);
      return;
    }
    console.warn(`listening for changes in buffer: ${buf.id}`);
    buf.listen("lines", receivedBufferEvent);
  });
}

export async function neovimClipboardCopy(): Promise<void> {
  const editor = ide().activeTextEditor as NeovimTextEditorImpl;
  const client = neovimClient();
  const window = await client.window;
  const selections = await bufferGetSelections(window, client);
  const data = editor.document.getText(selections[0]);
  await putToClipboard(data, client);
}

export async function neovimClipboardPaste(): Promise<void> {
  const editor = ide().activeTextEditor as NeovimTextEditorImpl;
  const client = neovimClient();
  const window = await client.window;
  const data = await getFromClipboard(client);
  // TODO: get the current selection indexes,
  // retrieve the corresponding lines from the Buffer,
  // and replace the lines with the pasted data
  // NO: just issue an insert (CTRL+V) in lua
}
