import type { RunMode } from "@cursorless/lib-common";
import { activate as activateCore } from "@cursorless/lib-talon-core";
import * as talon from "talon";

export async function activate(runMode: RunMode): Promise<void> {
  await activateCore(talon, runMode);
}
