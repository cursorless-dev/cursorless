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

  private_cursorless_run_rpc_command_get(
    commandId: string,
    command: unknown,
  ): Promise<unknown> {
    return runCommand(commandId, command);
  },
});

function runCommand(commandId: string, command: unknown): Promise<unknown> {
  if (commandId !== "cursorless.command") {
    throw Error(`Unknown command ID: ${commandId}`);
  }
  if (commandApi == null) {
    throw Error("commandApi is not initialized.");
  }
  if (ide == null) {
    throw Error("ide is not initialized.");
  }

  print(JSON.stringify(command, null, 2));

  ide.updateTextEditor();

  return commandApi.runCommandSafe(command);
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
