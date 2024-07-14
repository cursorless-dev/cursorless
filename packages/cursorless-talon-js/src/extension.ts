import "./polyfill";
import {
  createCursorlessEngine,
  type CommandApi,
} from "@cursorless/cursorless-engine";
import { Context, actions } from "talon";
import { TalonJsIDE } from "./ide/TalonJsIDE";

const ctx = new Context();
let commandApi: CommandApi | undefined;
let ide: TalonJsIDE | undefined;

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
    if (commandId !== "cursorless.command") {
      throw Error(`Unknown command ID: ${commandId}`);
    }

    const documentState = actions.user.cursorless_js_get_document_state();
    ide.updateTextEditors(documentState);

    return await commandApi.runCommandSafe(command);
  } catch (error) {
    print(error);
    throw error;
  }
}

async function activate(): Promise<void> {
  print("activate talon.js");

  try {
    ide = new TalonJsIDE();

    const engine = await createCursorlessEngine({ ide });

    commandApi = engine.commandApi;
  } catch (error) {
    print(error);
  }
}

void activate();
