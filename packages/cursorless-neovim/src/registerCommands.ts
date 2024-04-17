import {
  CURSORLESS_COMMAND_ID,
  CommandLatest,
  CommandServerApi,
  CursorlessCommandId,
} from "@cursorless/common";
import { updateTextEditor } from "./neovimHelpers";
import { modeSwitchNormalTerminal, modeSwitchTerminal } from "./neovimApi";
// TODO - we need to fix that import as we should not be allowed to import it afaict?
//import { ensureCommandShape } from "../../cursorless-engine/src/core/commandVersionUpgrades/ensureCommandShape";
import { ensureCommandShape } from "@cursorless/cursorless-engine/src/core/commandVersionUpgrades/ensureCommandShape";
import { NeovimClient } from "neovim";
import { NeovimIDE } from "./ide/neovim/NeovimIDE";
import { CommandApi } from "@cursorless/cursorless-engine";

/**
 * Handle the command received from the command-server Neovim extension
 *
 * Note how this file is named registerCommands.ts but it does not register any command.
 * Instead it implements the command handler directly.
 * This is to match the cursorless-vscode's registerCommands.ts file structure.
 * @param allArguments something like XXX
 * @returns
 */
export function handleCommandInternal(...allArguments: any[]): Promise<any> {
  const [client, neovimIDE, commandApi, cmdSrvApi, command, ...rest] =
    allArguments as [
      NeovimClient,
      NeovimIDE,
      CommandApi,
      CommandServerApi,
      string,
      ...unknown[],
    ];

  const commands: Record<CursorlessCommandId, (...args: any[]) => any> = {
    // The core Cursorless command
    [CURSORLESS_COMMAND_ID]: async (...args: unknown[]) => {
      const originalMode = await client.mode;
      if (originalMode.mode === "t") {
        // Switch to "nt" so we can easily call lua functions without any problems
        modeSwitchNormalTerminal(client);
      }

      // try {

      await updateTextEditor(client, neovimIDE);
      const result = await commandApi.runCommandSafe(...args);

      const command = ensureCommandShape(args) as CommandLatest;
      const focusedElementType = await cmdSrvApi.getFocusedElementType();
      if (
        focusedElementType === "terminal" &&
        command.action.name === "replaceWithTarget"
      ) {
        // if user runs a terminal, and a "bring" command was requested, switch back to "t" mode
        // so the fallback can do its magic
        modeSwitchTerminal(client);
      }

      return result;

      // TODO: use neovimIDE.runMode === "test" instead of isTesting()
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
  // NOTE: making the below notation work is not needed anymore as we will use pure dependency injection
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
