import type { RunMode } from "@cursorless/lib-common";
import type { ActivateReturnValue, Talon } from "@cursorless/lib-talon-core";

export interface Extension {
  activate(talon: Talon, runMode: RunMode): Promise<ActivateReturnValue>;
}
