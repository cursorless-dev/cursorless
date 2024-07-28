import { CURSORLESS_COMMAND_ID } from "@cursorless/common";
import type { CommandApi } from "@cursorless/cursorless-engine";
import type { TalonJsIDE } from "./ide/TalonJsIDE";
import type { Talon } from "./types/talon.types";

export function registerCommands(
  talon: Talon,
  ide: TalonJsIDE,
  commandApi: CommandApi,
) {
  const ctx = talon.Context();
  ctx.matches = "not app: vscode";

  ctx.action_class("user", {
    private_cursorless_run_rpc_command_no_wait(
      commandId: string,
      command: unknown,
    ): void {
      void runCommand(commandId, command);
    },

    async private_cursorless_run_rpc_command_get(
      commandId: string,
      command: unknown,
    ): Promise<unknown> {
      return await runCommand(commandId, command);
    },
  });

  async function runCommand(
    commandId: string,
    command: unknown,
  ): Promise<unknown> {
    try {
      if (commandId !== CURSORLESS_COMMAND_ID) {
        throw Error(`Unknown command ID: ${commandId}`);
      }

      // We don't have all the document on change events, so we need to make
      // sure that text editor is up to date before we run the command
      const editorState =
        talon.actions.user.cursorless_everywhere_get_editor_state();
      ide.updateTextEditors(editorState);

      return await commandApi.runCommandSafe(command);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
