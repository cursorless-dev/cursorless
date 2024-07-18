import { CURSORLESS_COMMAND_ID } from "@cursorless/common";
import type { CommandApi } from "@cursorless/cursorless-engine";
import { Context, actions } from "talon";
import type { TalonJsIDE } from "./ide/TalonJsIDE";

const ctx = new Context();

let ide: TalonJsIDE | undefined;
let commandApi: CommandApi | undefined;

ctx.matches = `
not tag: user.cursorless
`;

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
    if (ide == null) {
      throw Error("ide is not initialized.");
    }
    if (commandApi == null) {
      throw Error("commandApi is not initialized.");
    }
    if (commandId !== CURSORLESS_COMMAND_ID) {
      throw Error(`Unknown command ID: ${commandId}`);
    }

    const editorState = actions.user.cursorless_everywhere_get_editor_state();
    ide.updateTextEditors(editorState);

    return await commandApi.runCommandSafe(command);
  } catch (error) {
    print(error);
    throw error;
  }
}

export function registerCommands(ide_: TalonJsIDE, commandApi_: CommandApi) {
  ide = ide_;
  commandApi = commandApi_;
}
