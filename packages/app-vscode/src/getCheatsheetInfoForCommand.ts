import type { CheatsheetInfo } from "@cursorless/lib-common";
import {
  applyLegacyCheatsheetInfo,
  getCheatsheetInfo,
} from "@cursorless/lib-common";
import type { FileSystemTalonSpokenForms } from "@cursorless/lib-node-common";
import type { VscodeApi } from "@cursorless/lib-vscode-common";
import type { CheatSheetCommandArg } from "./ide/CheatSheetCommandArg";

export async function getCheatsheetInfoForCommand(
  vscodeApi: VscodeApi,
  arg: CheatSheetCommandArg,
  talonSpokenForms: FileSystemTalonSpokenForms,
): Promise<CheatsheetInfo> {
  const version = arg.version;

  if (version === 0) {
    void vscodeApi.window.showWarningMessage(
      "Cheatsheet command version 0 is deprecated. Please update cursorless-talon",
    );
    return applyLegacyCheatsheetInfo(
      getCheatsheetInfo({ includeDisabledByDefault: true }),
      arg.spokenFormInfo,
    );
  }

  if (version === 1) {
    return getCheatsheetInfo({
      listEntries: await talonSpokenForms.getSpokenFormLists(),
    });
  }

  throw new Error(`Unsupported cheatsheet command version: ${version}`);
}
