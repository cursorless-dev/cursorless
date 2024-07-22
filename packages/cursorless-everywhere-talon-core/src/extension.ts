import "./polyfill";

import type { RunMode } from "@cursorless/common";
import { createCursorlessEngine } from "@cursorless/cursorless-engine";
import { getRunMode } from "./ide/getRunMode";
import { TalonJsIDE } from "./ide/TalonJsIDE";
import { registerCommands } from "./registerCommands";
import type { ActivateReturnValue } from "./types/types";
import type { Talon } from "./types/talon.types";

export async function activate(
  talon: Talon,
  runMode?: RunMode,
): Promise<ActivateReturnValue> {
  runMode = runMode ?? (await getRunMode());

  console.debug(`activate talon.js @ ${runMode}`);

  try {
    const ide = new TalonJsIDE(talon, runMode);

    const engine = await createCursorlessEngine({ ide });

    const commandApi = engine.commandApi;

    registerCommands(talon, ide, commandApi);

    const testHelpers = runMode === "test" ? { ide } : undefined;

    return { testHelpers };
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    console.debug("talon.js activated");
  }
}
