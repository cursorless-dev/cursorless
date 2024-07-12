import { ExtensionContext, ExtensionMode } from "vscode";
import type { RunMode } from "@cursorless/common";
import { getEnvironmentalMode } from "@cursorless/node-common";

const EXTENSION_MODE_MAP: Record<ExtensionMode, RunMode> = {
  [ExtensionMode.Development]: "development",
  [ExtensionMode.Production]: "production",
  [ExtensionMode.Test]: "test",
};

export function vscodeRunMode(extensionContext: ExtensionContext): RunMode {
  const envMode = getEnvironmentalMode();
  const extensionMode = EXTENSION_MODE_MAP[extensionContext.extensionMode];

  if (envMode !== extensionMode) {
    throw new Error(
      `Extension mode '${extensionMode}' doesn't match environmental mode '${envMode}'`,
    );
  }

  return extensionMode;
}
