import type { RunMode } from "@cursorless/common";
import { activate as activateCore } from "@cursorless/cursorless-everywhere-talon-core";
import * as talon from "talon";

export async function activate(runMode: RunMode): Promise<void> {
  await activateCore(talon, runMode);
}
