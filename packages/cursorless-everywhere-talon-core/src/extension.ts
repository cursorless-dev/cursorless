import "./polyfill";

import {
  FakeCommandServerApi,
  FakeIDE,
  NormalizedIDE,
  type RunMode,
} from "@cursorless/common";
import { createCursorlessEngine } from "@cursorless/cursorless-engine";
import { constructTestHelpers } from "./constructTestHelpers";
import { getRunMode } from "./ide/getRunMode";
import { TalonJsIDE } from "./ide/TalonJsIDE";
import { registerCommands } from "./registerCommands";
import type { Talon } from "./types/talon.types";
import type { ActivateReturnValue } from "./types/types";

export async function activate(
  talon: Talon,
  runMode?: RunMode,
): Promise<ActivateReturnValue> {
  try {
    return await activateHelper(talon, runMode);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function activateHelper(
  talon: Talon,
  runMode?: RunMode,
): Promise<ActivateReturnValue> {
  runMode = runMode ?? (await getRunMode());

  console.debug(`activate talon.js @ ${runMode}`);

  const talonJsIDE = new TalonJsIDE(talon, runMode);

  const normalizedIde =
    talonJsIDE.runMode === "production"
      ? talonJsIDE
      : new NormalizedIDE(
          talonJsIDE,
          new FakeIDE(),
          talonJsIDE.runMode === "test",
        );

  const fakeCommandServerApi = new FakeCommandServerApi();
  const commandServerApi =
    normalizedIde.runMode === "test" ? fakeCommandServerApi : undefined;

  const { commandApi, injectIde, hatTokenMap, storedTargets } =
    await createCursorlessEngine({ ide: normalizedIde, commandServerApi });

  registerCommands(talon, talonJsIDE, commandApi);

  const testHelpers =
    runMode === "test"
      ? constructTestHelpers({
          talonJsIDE,
          normalizedIde: normalizedIde as NormalizedIDE,
          injectIde,
          hatTokenMap,
          commandServerApi: fakeCommandServerApi,
          storedTargets,
        })
      : undefined;

  console.debug("talon.js activated");

  return { testHelpers };
}
