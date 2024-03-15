import {
  CURSORLESS_COMMAND_ID,
  CursorlessCommandId,
  Position,
  Range,
} from "@cursorless/common";
import { commandApi } from "./singletons/cmdapi.singleton";
import { neovimContext } from "./singletons/context.singleton";
import { ide } from "./singletons/ide.singleton";
import { NeovimTextDocumentImpl } from "./ide/neovim/NeovimTextDocumentImpl";
import { bufferManager } from "./singletons/bufmgr.singleton";
import { URI } from "vscode-uri";
import { NeovimClient } from "neovim/lib/api/client";
import { Window } from "neovim/lib/api/Window";
// import {
//   CommandApi,
//   TestCaseRecorder,
//   analyzeCommandHistory,
//   showCheatsheet,
//   updateDefaults,
// } from "@cursorless/cursorless-engine";
// import * as vscode from "vscode";
// import { ScopeVisualizer } from "./ScopeVisualizerCommandApi";
// import { showDocumentation, showQuickPick } from "./commands";
// import { VscodeIDE } from "./ide/vscode/VscodeIDE";
// import { VscodeHats } from "./ide/vscode/hats/VscodeHats";
// import { KeyboardCommands } from "./keyboard/KeyboardCommands";
// import { logQuickActions } from "./logQuickActions";

/**
 * Initialize the current editor (and current document).
 * We always overwrite the current editor from scratch for now
 * because we reinitialize it for every command we receive
 *
 * TODO: We only initialize one editor(current window) with one document(current buffer)
 *       we need to support updating editors and documents on the fly
 */
export async function updateTextEditor() {
  const client = neovimContext().client;
  const window = await client.window;
  const buffer = await window.buffer;
  const lines = await buffer.lines;
  console.warn(
    `creating editor/document for window:${window.id} buffer:${buffer.id}`,
  );
  // const result = await client.call("WindowGetVisibleLines", []);
  const luaCode = `
  local ret = {vim.fn.line('w0'), vim.fn.line('w$')}
  return ret
`;
  const visibleRanges = await windowGetVisibleRanges(window, client, lines);
  ide().toNeovimEditor(window, buffer.id, lines, visibleRanges);
}

/**
 * Get the current visible ranges in the window(editor) (vertically).
 * This accounts only for vertical scrolling, and not for horizontal scrolling.
 * TODO: support any window as atm only supports the current window
 */
async function windowGetVisibleRanges(
  window: Window,
  client: NeovimClient,
  lines: string[],
): Promise<Range[]> {
  // Get the first and last visible lines of the current window
  // w0/w$ are indexed from 1, similarly to what is shown in neovim
  const luaCode = `
  local ret = {vim.fn.line('w0'), vim.fn.line('w$')}
  return ret
`;
  const [firstLine, lastLine] = (await client.executeLua(
    luaCode,
    [],
  )) as Array<number>;
  // we need to subtract 1 to get the correct 0-based line numbers
  return [
    new Range(
      new Position(firstLine - 1, 0),
      // subtract -1 to the line length to get the correct 0-based column number
      new Position(lastLine - 1, lines[lastLine].length - 1),
    ),
  ];
}

// export function registerCommands(
// extensionContext: vscode.ExtensionContext,
// vscodeIde: VscodeIDE,
// commandApi: CommandApi,
// fileSystem: FileSystem,
// testCaseRecorder: TestCaseRecorder,
// scopeVisualizer: ScopeVisualizer,
// keyboardCommands: KeyboardCommands,
// hats: VscodeHats,
// ): void {
export function handleCommandInternal(...allArguments: any[]): Promise<any> {
  console.warn(`handleCommandInternal(): allArguments =${allArguments}`);
  const [command, ...rest] = allArguments as [string, ...unknown[]];

  const commands: Record<CursorlessCommandId, (...args: any[]) => any> = {
    // The core Cursorless command
    [CURSORLESS_COMMAND_ID]: async (...args: unknown[]) => {
      // try {
      updateTextEditor();
      const result = await commandApi().runCommandSafe(...args);
      // const result = ["hello world"]; // simulate the result of "bring <target>"
      return result;
      // } catch (e) {
      //   // if (!isTesting()) {
      //   //   const err = e as Error;
      //   //   console.error(err.stack);
      //   //   vscodeIde.handleCommandError(err);
      //   // }
      //   throw e;
      // }
    },
    // Cheatsheet commands
    ["cursorless.showCheatsheet"]: dummyCommandHandler,
    ["cursorless.internal.updateCheatsheetDefaults"]: dummyCommandHandler,
    // Testcase recorder commands
    ["cursorless.recordTestCase"]: dummyCommandHandler,
    ["cursorless.recordOneTestCaseThenPause"]: dummyCommandHandler,
    ["cursorless.pauseRecording"]: dummyCommandHandler,
    ["cursorless.resumeRecording"]: dummyCommandHandler,
    ["cursorless.takeSnapshot"]: dummyCommandHandler,
    // Other commands
    ["cursorless.showQuickPick"]: dummyCommandHandler,
    ["cursorless.showDocumentation"]: dummyCommandHandler,
    ["cursorless.private.logQuickActions"]: dummyCommandHandler,
    // Hats
    ["cursorless.toggleDecorations"]: dummyCommandHandler,
    ["cursorless.recomputeDecorationStyles"]: dummyCommandHandler,
    // Scope visualizer
    ["cursorless.showScopeVisualizer"]: dummyCommandHandler,
    ["cursorless.hideScopeVisualizer"]: dummyCommandHandler,
    // Command history
    ["cursorless.analyzeCommandHistory"]: dummyCommandHandler,
    // General keyboard commands
    ["cursorless.keyboard.escape"]: dummyCommandHandler,
    // Targeted keyboard commands
    ["cursorless.keyboard.targeted.targetHat"]: dummyCommandHandler,
    ["cursorless.keyboard.targeted.targetScope"]: dummyCommandHandler,
    ["cursorless.keyboard.targeted.targetSelection"]: dummyCommandHandler,
    ["cursorless.keyboard.targeted.clearTarget"]: dummyCommandHandler,
    ["cursorless.keyboard.targeted.runActionOnTarget"]: dummyCommandHandler,
    // Modal keyboard commands
    ["cursorless.keyboard.modal.modeOn"]: dummyCommandHandler,
    ["cursorless.keyboard.modal.modeOff"]: dummyCommandHandler,
    ["cursorless.keyboard.modal.modeToggle"]: dummyCommandHandler,
  };

  if (command !== "cursorless.command") {
    console.warn(
      `handleCommandInternal(): command=${command} is not supported`,
    );
    return new Promise((resolve) => []);
  }

  return commands["cursorless.command"](...rest);
  // TODO: make the below notation work
  // const HandlerFunction = (command: string) => {
  //   commands[command](...rest);
  // };

  // HandlerFunction(command);
  // extensionContext.subscriptions.push(
  //   ...Object.entries(commands).map(([commandId, callback]) =>
  //     vscode.commands.registerCommand(commandId, callback),
  //   ),
  // );
}

export async function dummyCommandHandler(...args: any[]) {
  console.warn(`dummyCommandHandler(): args=${args}`);
}
