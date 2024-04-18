import {
  bufferGetSelections,
  windowGetVisibleRanges,
} from "../../neovim-common/src/neovimApi";
import { Range, Selection } from "@cursorless/common";
import { NeovimClient } from "neovim";
// import { eventEmitter } from "./events";
import { NeovimIDE } from "./ide/neovim/NeovimIDE";
import { NeovimTextEditorImpl } from "./ide/neovim/NeovimTextEditorImpl";
import { neovimRegistry } from "@cursorless/neovim-registry";

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
export async function updateTextEditor(
  client: NeovimClient,
  neovimIDE: NeovimIDE,
  minimal: boolean = false,
): Promise<NeovimTextEditorImpl> {
  const window = await client.window;
  const buffer = await window.buffer;
  const lines = await buffer.lines;
  let linesShown = lines;
  if (lines.length >= 30) {
    linesShown = lines.slice(0, 15).concat(["..."]).concat(lines.slice(-15));
  }
  console.warn(
    `updateTextEditor(): window:${window.id}, buffer:${buffer.id}, lines=${JSON.stringify(linesShown)}`,
  );
  let selections: Selection[];
  let visibleRanges: Range[];
  if (!minimal) {
    selections = await bufferGetSelections(window, client);
    visibleRanges = await windowGetVisibleRanges(window, client, lines);
  } else {
    selections = [];
    visibleRanges = [];
  }
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
  // eventEmitter.emit("onDidOpenTextDocument", editor.document);
  neovimRegistry.emitEvent("onDidOpenTextDocument", editor.document);

  return editor;
}
