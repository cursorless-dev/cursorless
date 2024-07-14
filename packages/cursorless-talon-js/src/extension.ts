import "./polyfill";
import {
  createCursorlessEngine,
  type CommandApi,
} from "@cursorless/cursorless-engine";
import { Context } from "talon";
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
    print("private_cursorless_run_rpc_command_get pre");

    const res = await runCommand(commandId, command);

    print("private_cursorless_run_rpc_command_get post");

    return res;
  },
});

async function runCommand(
  commandId: string,
  command: unknown,
): Promise<unknown> {
  if (ide == null) {
    throw Error("ide is not initialized.");
  }
  if (commandApi == null) {
    throw Error("commandApi is not initialized.");
  }
  if (commandId !== "cursorless.command") {
    throw Error(`Unknown command ID: ${commandId}`);
  }

  //   print(JSON.stringify(command, null, 2));

  ide.updateTextEditor();

  try {
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

  print("talon.js activated");
}

void activate();
