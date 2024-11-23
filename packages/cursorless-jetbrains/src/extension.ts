import type { CursorlessEngine } from "@cursorless/cursorless-engine";
import { createCursorlessEngine } from "@cursorless/cursorless-engine";
import type { JetbrainsPlugin } from "./ide/JetbrainsPlugin";
import { JetbrainsIDE } from "./ide/JetbrainsIDE";

export async function activate(
  plugin: JetbrainsPlugin,
): Promise<CursorlessEngine> {
  const engine = await createCursorlessEngine({
    ide: plugin.ide,
    hats: plugin.hats,
  });
  return engine;
  console.log("activate completed");
}
