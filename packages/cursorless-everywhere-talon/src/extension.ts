import "./polyfill";

import type { RunMode } from "@cursorless/common";
import { createCursorlessEngine } from "@cursorless/cursorless-engine";
import { getRunMode } from "./ide/getRunMode";
import { TalonJsIDE } from "./ide/TalonJsIDE";
import { registerCommands } from "./registerCommands";

let promise: Promise<void> | undefined;

export function activate(runMode?: RunMode): Promise<void> {
  if (promise == null) {
    promise = activateInternal(runMode);
  }

  return promise;
}

async function activateInternal(runMode?: RunMode): Promise<void> {
  runMode = runMode ?? (await getRunMode());

  print(`activate talon.js @ ${runMode}`);

  try {
    const ide = new TalonJsIDE(runMode);

    const engine = await createCursorlessEngine({ ide });

    const commandApi = engine.commandApi;

    registerCommands(ide, commandApi);
  } catch (error) {
    print(error);
    throw error;
  }

  print("talon.js activated");
}
