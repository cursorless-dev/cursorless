import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "node-html-parser";
import { getCheatsheetInfo, showWarning } from "@cursorless/lib-common";
import type { CheatsheetInfo, IDE } from "@cursorless/lib-common";
import type { FileSystemTalonSpokenForms } from "./FileSystemTalonSpokenForms";

interface CheatSheetCommandArgV0 {
  version: 0;

  /** The file to write the cheatsheet to. */
  outputPath: string;

  /**
   * A representation of all spoken forms that is used to generate the
   * cheatsheet.
   */
  spokenFormInfo: CheatsheetInfo;
}

/** The extension assembles the cheatsheet from the Talon state file. */
interface CheatSheetCommandArgV1 {
  version: 1;

  /** The file to write the cheatsheet to. */
  outputPath: string;
}

export type CheatSheetCommandArg =
  | CheatSheetCommandArgV0
  | CheatSheetCommandArgV1;

export async function showCheatsheet(
  ide: IDE,
  talonSpokenForms: FileSystemTalonSpokenForms,
  arg: CheatSheetCommandArg,
) {
  const cheatsheetInfo = await getCheatsheetInfoForCommand(
    ide,
    talonSpokenForms,
    arg,
  );
  const cheatsheetPath = path.join(ide.assetsRoot, "cheatsheet.html");
  const cheatsheetContent = await readFile(cheatsheetPath, "utf8");
  const root = parse(cheatsheetContent);

  root.getElementById("cheatsheet-data")!.textContent =
    `document.cheatsheetInfo = ${JSON.stringify(cheatsheetInfo)};`;

  await writeFile(arg.outputPath, root.toString());
}

async function getCheatsheetInfoForCommand(
  ide: IDE,
  talonSpokenForms: FileSystemTalonSpokenForms,
  arg: CheatSheetCommandArg,
): Promise<CheatsheetInfo> {
  const version = arg.version;

  if (version === 0) {
    // DEPRECATED: 2026-08-31
    void showWarning(
      ide.messages,
      "cheatSheetV0Deprecated",
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
