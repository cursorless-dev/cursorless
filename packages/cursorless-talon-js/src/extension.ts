import "./polyfill";

import type { RunMode } from "@cursorless/common";
import { createCursorlessEngine } from "@cursorless/cursorless-engine";
import { TalonJsIDE } from "./ide/TalonJsIDE";
import { registerCommands } from "./registerCommands";

export async function activate(runMode: RunMode): Promise<void> {
  print(`activate talon.js @ ${runMode}`);

  try {
    const ide = new TalonJsIDE(runMode);

    const engine = await createCursorlessEngine({ ide });

    const commandApi = engine.commandApi;

    registerCommands(ide, commandApi);
  } catch (error) {
    print(error);
  }

  print("talon.js activated");
}
