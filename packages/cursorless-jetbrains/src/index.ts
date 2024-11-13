import type {
  Command,
  CommandServerApi,
  Hats,
  IDE,
  ScopeProvider,
} from "@cursorless/common";
import { createCursorlessEngine } from "@cursorless/cursorless-engine";
import type { JetbrainsPlugin } from "./ide/JetbrainsPlugin";
import type { JetbrainsIDE } from "./ide/JetbrainsIDE";

export function entry(plugin: JetbrainsPlugin) {
  const jetbrainsIDE = new JetbrainsIDE(plugin.client);
  createCursorlessEngine({
    ide: jetbrainsIDE,
  });
  console.log("entry completed");
}

export function createPlugin(client: JetbrainsClient): JetbrainsPlugin {
  return new JetbrainsPlugin(client);
}

export * from "./ide/JetbrainsPlugin";
export * from "./ide/JetbrainsIDE";
