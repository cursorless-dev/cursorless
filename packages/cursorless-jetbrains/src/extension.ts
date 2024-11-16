import "./polyfill";

import type { CursorlessEngine } from "@cursorless/cursorless-engine";
import { createCursorlessEngine } from "@cursorless/cursorless-engine";
import { JetbrainsPlugin } from "./ide/JetbrainsPlugin";
import { JetbrainsIDE } from "./ide/JetbrainsIDE";

export async function activate(plugin: JetbrainsPlugin): Promise<CursorlessEngine> {
  const jetbrainsIDE = new JetbrainsIDE(plugin.client);
  const engine = await createCursorlessEngine({
    ide: jetbrainsIDE,
  });
  return engine
  console.log("entry completed");
}
