import { ExtensionContext, ExtensionMode } from "vscode";
import type { RunMode } from "../../libs/common/ide/types/ide.types";

const EXTENSION_MODE_MAP: Record<ExtensionMode, RunMode> = {
  [ExtensionMode.Development]: "development",
  [ExtensionMode.Production]: "production",
  [ExtensionMode.Test]: "test",
};

export default function vscodeRunMode(
  extensionContext: ExtensionContext,
): RunMode {
  return EXTENSION_MODE_MAP[extensionContext.extensionMode];
}
