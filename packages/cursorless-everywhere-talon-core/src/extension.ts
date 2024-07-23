import "./polyfill";

import {
  FakeCommandServerApi,
  FakeIDE,
  NormalizedIDE,
  type RunMode,
} from "@cursorless/common";
import { createCursorlessEngine } from "@cursorless/cursorless-engine";
import { constructTestHelpers } from "./constructTestHelpers";
import { TalonJsIDE } from "./ide/TalonJsIDE";
import { TalonJsTestHats } from "./ide/TalonJsTestHats";
import { registerCommands } from "./registerCommands";
import type { Talon } from "./types/talon.types";
import type { ActivateReturnValue } from "./types/types";

export async function activate(
  talon: Talon,
  runMode: RunMode,
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
  runMode: RunMode,
): Promise<ActivateReturnValue> {
  console.debug(`activate talon.js @ ${runMode}`);

  const isTesting = runMode === "test";
  const talonJsIDE = new TalonJsIDE(talon, runMode);
  const commandServerApi = isTesting ? new FakeCommandServerApi() : undefined;
  const hats = isTesting ? new TalonJsTestHats() : undefined;

  const normalizedIde =
    runMode === "production"
      ? talonJsIDE
      : new NormalizedIDE(talonJsIDE, new FakeIDE(), isTesting);

  const { commandApi, injectIde, hatTokenMap, storedTargets } =
    await createCursorlessEngine({
      ide: normalizedIde,
      commandServerApi,
      hats,
    });

  registerCommands(talon, talonJsIDE, commandApi);

  const testHelpers = isTesting
    ? constructTestHelpers({
        talonJsIDE,
        normalizedIde: normalizedIde as NormalizedIDE,
        injectIde,
        commandApi,
        hatTokenMap,
        commandServerApi: commandServerApi as FakeCommandServerApi,
        storedTargets,
      })
    : undefined;

  console.debug("talon.js activated");

  return { testHelpers };
}
