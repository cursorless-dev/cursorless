import type {
  CheatSheetCommandArg,
  CheatsheetInfo,
} from "@cursorless/lib-common";
import { getCheatsheetInfo } from "@cursorless/lib-common";
import type { FileSystemTalonSpokenForms } from "@cursorless/lib-node-common";
import { vscodeApi } from "./vscodeApi";

export async function getCheatsheetInfoForCommand(
  arg: CheatSheetCommandArg,
  talonSpokenForms: FileSystemTalonSpokenForms,
): Promise<CheatsheetInfo> {
  const version = arg.version;

  if (version === 0) {
    // DEPRECATED: 2026-08-31
    void vscodeApi.window.showWarningMessage(
      "Cheat sheet command version 0 is deprecated. Please update cursorless-talon.",
    );
    return arg.spokenFormInfo;
  }

  if (version === 1) {
    return getCheatsheetInfo({
      spokenFormEntries: await talonSpokenForms.getSpokenFormEntries(),
    });
  }

  throw new Error(`Unsupported cheatsheet command version: ${version}`);
}
