import type { CheatsheetInfo } from "@cursorless/lib-common";
import {
  applyLegacyCheatsheetInfo,
  getCheatsheetInfo,
} from "@cursorless/lib-common";
import type {
  CheatSheetCommandArg,
  FileSystemTalonSpokenForms,
} from "@cursorless/lib-node-common";

export async function getCheatsheetInfoForCommand(
  arg: CheatSheetCommandArg,
  talonSpokenForms: FileSystemTalonSpokenForms,
): Promise<CheatsheetInfo> {
  if (arg.version === 0) {
    return applyLegacyCheatsheetInfo(
      getCheatsheetInfo({ includeDisabledByDefault: true }),
      arg.spokenFormInfo,
    );
  }

  return getCheatsheetInfo({
    listEntries: await talonSpokenForms.getSpokenFormLists(),
  });
}
