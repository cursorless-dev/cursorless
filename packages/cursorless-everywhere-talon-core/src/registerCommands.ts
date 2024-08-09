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
    /**
     * Executes an RPC command without waiting for the result.
     * This function is useful for fire-and-forget operations where
     * the result is not immediately needed.
     *
     * @param commandId - The identifier of the command to be executed.
     * @param command - The command object containing necessary parameters.
     */
    private_cursorless_run_rpc_command_no_wait(
      commandId: string,
      command: unknown,
    ): void {
      void runCommand(commandId, command);
    },

    /**
     * Retrieves the response from the last RPC command execution.
     *
     * This is useful because TalonJS doesn't have a way to read the responses from promises,
     * but it does wait for them, so we store the response in a global variable and let it be
     * read by this action.
     *
     * @returns The most recent response from an RPC command, or null if no
     *          command has been executed yet.
     */
    private_cursorless_talonjs_get_response(): unknown {
      return lastCommandResponse;
    },

    /**
     * Executes an RPC command and waits for the result.
     * This function is useful when the result of the command is needed
     * immediately after execution.
     *
     * @param commandId - The identifier of the command to be executed.
     * @param command - The command object containing necessary parameters.
     * @returns A Promise that resolves with the result of the command execution.
     */
    async private_cursorless_run_rpc_command_get(
      commandId: string,
      command: unknown,
    ): Promise<unknown> {
      lastCommandResponse = await runCommand(commandId, command);
      return lastCommandResponse;
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
