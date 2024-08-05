import type { ExtensionContext } from "vscode";
import { ExtensionMode } from "vscode";
import type { RunMode } from "@cursorless/common";
import { nodeGetRunMode } from "@cursorless/node-common";

const EXTENSION_MODE_MAP: Record<ExtensionMode, RunMode> = {
  [ExtensionMode.Development]: "development",
  [ExtensionMode.Production]: "production",
  [ExtensionMode.Test]: "test",
};

export function vscodeRunMode(extensionContext: ExtensionContext): RunMode {
  const envMode = nodeGetRunMode();
  const extensionMode = EXTENSION_MODE_MAP[extensionContext.extensionMode];

  if (envMode !== extensionMode) {
    throw new Error(
      `Extension mode '${extensionMode}' doesn't match environment variable mode '${envMode}'`,
    );
  }

  return extensionMode;
}
