import type { RunMode } from "@cursorless/common";
import { actions, Context, settings } from "talon";
import { activate as activateCore } from "@cursorless/cursorless-everywhere-talon-core";

export async function activate(runMode: RunMode): Promise<void> {
  await activateCore(
    {
      actions,
      settings,
      createContext: () => new Context(),
    },
    runMode,
  );
}
