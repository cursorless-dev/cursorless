import { CURSORLESS_COMMAND_ID } from "@cursorless/common";
import type { CommandApi } from "@cursorless/cursorless-engine";
import type { TalonJsIDE } from "./ide/TalonJsIDE";
import type { Talon } from "./types/talon.types";

export function registerCommands(
  talon: Talon,
  ide: TalonJsIDE,
  commandApi: CommandApi,
) {
  const ctx = new talon.Context();
  ctx.matches = "tag: user.cursorless_everywhere_talon";

  let lastCommandResponse: unknown = null;

  ctx.action_class("user", {
    async private_cursorless_talonjs_run_and_wait(
      commandId: string,
      command: unknown,
    ): Promise<void> {
      lastCommandResponse = await runCommand(commandId, command);
    },

    private_cursorless_talonjs_run_no_wait(
      commandId: string,
      command: unknown,
    ): void {
      void runCommand(commandId, command);
      lastCommandResponse = null;
    },

    private_cursorless_talonjs_get_response(): string {
      // Talon JS doesn't convert JS objects to Python objects, and also doesn't provide
      // a way to inspect types, so just serialize the response to JSON
      return JSON.stringify(lastCommandResponse);
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
