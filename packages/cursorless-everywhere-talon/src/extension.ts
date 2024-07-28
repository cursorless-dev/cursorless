import type { RunMode } from "@cursorless/common";
import * as talon from "talon";
import { activate as activateCore } from "@cursorless/cursorless-everywhere-talon-core";

export async function activate(runMode: RunMode): Promise<void> {
  await activateCore(talon, runMode);
}
