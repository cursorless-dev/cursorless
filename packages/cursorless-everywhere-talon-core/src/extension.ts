import type { RunMode } from "@cursorless/common";
import { createCursorlessEngine } from "@cursorless/cursorless-engine";
import { getRunMode } from "./ide/getRunMode";
import { TalonJsIDE } from "./ide/TalonJsIDE";
import { registerCommands } from "./registerCommands";
import type { ActivateReturnValue } from "./types/types";

let promise: Promise<ActivateReturnValue> | undefined;

export function activate(runMode?: RunMode): Promise<ActivateReturnValue> {
  if (promise == null) {
    promise = activateInternal(runMode);
  }

  return promise;
}

async function activateInternal(
  runMode?: RunMode,
): Promise<ActivateReturnValue> {
  runMode = runMode ?? (await getRunMode());

  console.debug(`activate talon.js @ ${runMode}`);

  try {
    const ide = new TalonJsIDE(runMode);

    const engine = await createCursorlessEngine({ ide });

    const commandApi = engine.commandApi;

    registerCommands(ide, commandApi);

    const testHelpers = runMode === "test" ? { ide } : undefined;

    return { testHelpers };
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    console.debug("talon.js activated");
  }
}
