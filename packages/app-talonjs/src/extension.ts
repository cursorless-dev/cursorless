import * as talon from "talon";
import type { RunMode } from "@cursorless/lib-common";
import { activate as activateCore } from "@cursorless/lib-talonjs-core";

export async function activate(runMode: RunMode): Promise<void> {
  await activateCore(talon, runMode);
}
