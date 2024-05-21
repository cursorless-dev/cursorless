// Helper directly calling into Neovim apis, generally lua, exported by cursorless.nvim
import { Position, Range, Selection } from "@cursorless/common";
import type { NeovimClient } from "neovim/lib/api/client";
import type { Window } from "neovim/lib/api/Window";

/**
 * Get the current "selections" in the window(editor)
 *
 * At the moment we only support one selection because vim only supports one cursor
 * At the moment, we only support the current window, hence why the argument is not used
 */
export async function bufferGetSelections(
  window: Window,
  client: NeovimClient,
): Promise<Selection[]> {
  const luaCode = `return require("cursorless.cursorless").buffer_get_selection()`;
  // Note lines are indexed from 1, similarly to what is shown in neovim
  // and columns are also indexed from 1
  const [startLine, startCol, endLine, endCol, reverse] =
    (await client.executeLua(luaCode, [])) as [
      number,
      number,
      number,
      number,
      boolean,
    ];
  // subtract 1 to the lines/columns to get the correct 0-based line/column numbers
  let selections: Selection[];
  if (reverse === true) {
    selections = [
      new Selection(
        new Position(endLine - 1, endCol - 1),
        new Position(startLine - 1, startCol - 1),
      ),
    ];
  } else {
    selections = [
      new Selection(
        new Position(startLine - 1, startCol - 1),
        new Position(endLine - 1, endCol - 1),
      ),
    ];
  }

  console.debug(
    `bufferGetSelections(): selections=(${selections[0].start.line}, ${selections[0].start.character}), (${selections[0].end.line}, ${selections[0].end.character}) neovim=(${startLine},${startCol}),(${endLine},${endCol}),reverse=${reverse}`,
  );
  return selections;
}

export async function bufferSetSelections(
  // window: Window,
  client: NeovimClient,
  selections: Selection[],
) {
  if (selections.length !== 1) {
    throw new Error("bufferSetSelections() only supports one selection");
  }

  // cursorless has 0-based lines/columns, but neovim has 1-based lines and 0-based columns
  // also, experience shows we need to subtract 1 from the end character to stop on it in visual mode (instead of after it)
  // https://neovim.io/doc/user/api.html#nvim_win_set_cursor()
  const luaCode = `return require("cursorless.cursorless").select_range(${
    selections[0].start.line + 1
  }, ${selections[0].start.character}, ${selections[0].end.line + 1}, ${
    selections[0].end.character
  })`;
  console.debug(
    `bufferSetSelections() selections=(${selections[0].start.line},${selections[0].start.character}),(${selections[0].end.line},${selections[0].end.character}) luaCode="${luaCode}"`,
  );
  await client.executeLua(luaCode, []);
  // console.debug(`bufferSetSelections() done`);
}

/**
 * Get the current "visible" ranges in the window(editor) (vertically).
 * This accounts only for vertical scrolling, and not for horizontal scrolling.
 *
 * At the moment, we only support the current window, hence why the argument is not used
 */
export async function windowGetVisibleRanges(
  window: Window,
  client: NeovimClient,
  lines: string[],
): Promise<Range[]> {
  // Get the first and last visible lines of the current window
  // Note they are indexed from 1, similarly to what is shown in neovim*
  const luaCode = `return require("cursorless.cursorless").window_get_visible_lines()`;
  const [firstLine, lastLine] = (await client.executeLua(luaCode, [])) as [
    number,
    number,
  ];
  // subtract 1 to the lines to get the correct 0-based line numbers
  const range = new Range(
    new Position(firstLine - 1, 0),
    // subtract -1 to the line.length to get the correct 0-based column number
    new Position(lastLine - 1, lines[lastLine - 1].length - 1),
  );
  console.debug(
    `windowGetVisibleRanges(): range=(${range.start.line}, ${range.start.character}), (${range.end.line}, ${range.end.character})`,
  );
  return [range];
}

export async function getCursorlessNvimPath(
  client: NeovimClient,
): Promise<string> {
  const luaCode = `return require("cursorless.utils").cursorless_nvim_path()`;
  const data = (await client.executeLua(luaCode, [])) as unknown as string;
  return data as unknown as string;
}

/**
 * Save the data string into the operating system clipboard
 * https://vimdoc.sourceforge.net/htmldoc/eval.html#setreg()
 * https://stackoverflow.com/questions/11489428/how-can-i-make-vim-paste-from-and-copy-to-the-systems-clipboard?page=1&tab=scoredesc#tab-top
 * https://stackoverflow.com/questions/30691466/what-is-difference-between-vims-clipboard-unnamed-and-unnamedplus-settings
 */
export async function putToClipboard(data: string, client: NeovimClient) {
  await client.callFunction("setreg", ["*", data]);
}

/**
 * Return the string from the operating system clipboard
 * https://vimdoc.sourceforge.net/htmldoc/eval.html#getreg()
 */
export async function getFromClipboard(client: NeovimClient): Promise<string> {
  return await client.callFunction("getreg", ["*"]);
}

/**
 * Paste at current position from the operating system clipboard
 */
export async function pasteFromClipboard(client: NeovimClient) {
  const luaCode = `return require("cursorless.utils").paste()`;
  await client.executeLua(luaCode, []);
}

/**
 * Switch from terminal (t) mode to normal terminal (nt) mode
 * @param client
 */
export async function modeSwitchNormalTerminal(
  client: NeovimClient,
): Promise<void> {
  const luaCode = `return require("cursorless.utils").mode_switch_nt()`;
  await client.executeLua(luaCode, []);
}

/**
 * Switch from normal terminal (nt) mode to terminal (t) mode
 * @param client
 */
export async function modeSwitchTerminal(client: NeovimClient): Promise<void> {
  const luaCode = `return require("cursorless.utils").mode_switch_t()`;
  await client.executeLua(luaCode, []);
}

/**
 * Show an error message to the user
 * @param client
 * @param message
 * @see https://neovim.io/doc/user/lua.html#vim.notify()
 */
export async function showErrorMessage(
  client: NeovimClient,
  message: string,
): Promise<void> {
  // XXX - commenting to test if this avoids hanging problem in CI?
  // const luaCode = `vim.notify("${message}")`;
  // await client.executeLua(luaCode, []);
}
