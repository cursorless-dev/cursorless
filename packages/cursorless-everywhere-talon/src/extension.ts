import "./polyfill";

import type { RunMode } from "@cursorless/common";
import { activate as activateCore } from "@cursorless/cursorless-everywhere-talon-core";

export async function activate(runMode?: RunMode): Promise<void> {
  await activateCore(runMode);
}
