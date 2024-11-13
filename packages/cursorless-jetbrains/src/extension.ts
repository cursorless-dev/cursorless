import { createCursorlessEngine } from "@cursorless/cursorless-engine";
import { JetbrainsPlugin } from "./ide/JetbrainsPlugin";
import { JetbrainsIDE } from "./ide/JetbrainsIDE";

export function entry(plugin: JetbrainsPlugin) {
  const jetbrainsIDE = new JetbrainsIDE(plugin.client);
  createCursorlessEngine({
    ide: jetbrainsIDE,
  });
  console.log("entry completed");
}
