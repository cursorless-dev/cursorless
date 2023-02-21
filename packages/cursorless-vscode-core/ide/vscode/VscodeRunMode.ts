import { ExtensionContext, ExtensionMode } from "vscode";
import type { RunMode } from "@cursorless/common";

const EXTENSION_MODE_MAP: Record<ExtensionMode, RunMode> = {
  [ExtensionMode.Development]: "development",
  [ExtensionMode.Production]: "production",
  [ExtensionMode.Test]: "test",
};

export function vscodeRunMode(extensionContext: ExtensionContext): RunMode {
  return EXTENSION_MODE_MAP[extensionContext.extensionMode];
}
