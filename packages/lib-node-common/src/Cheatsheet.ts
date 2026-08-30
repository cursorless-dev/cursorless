import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "node-html-parser";
import type { CheatsheetInfo, IDE } from "@cursorless/lib-common";

/**
 * The argument expected by the cheatsheet command.
 */
interface CheatSheetCommandArgBase {
  /** The file to write the cheatsheet to. */
  outputPath: string;
}

export interface CheatSheetCommandArgV0 extends CheatSheetCommandArgBase {
  /**
   * The version of the cheatsheet command.
   */
  version: 0;

  /**
   * A representation of all spoken forms that is used to generate the
   * cheatsheet.
   */
  spokenFormInfo: CheatsheetInfo;
}

export interface CheatSheetCommandArgV1 extends CheatSheetCommandArgBase {
  /** The extension assembles the cheatsheet from the Talon state file. */
  version: 1;
}

export type CheatSheetCommandArg =
  | CheatSheetCommandArgV0
  | CheatSheetCommandArgV1;

export async function showCheatsheet(
  ide: IDE,
  { version, outputPath }: CheatSheetCommandArg,
  spokenFormInfo: CheatsheetInfo,
) {
  if (version !== 0 && version !== 1) {
    throw new Error(`Unsupported cheatsheet api version: ${version}`);
  }

  const cheatsheetPath = path.join(ide.assetsRoot, "cheatsheet.html");

  const cheatsheetContent = await readFile(cheatsheetPath, "utf8");

  const root = parse(cheatsheetContent);

  root.getElementById("cheatsheet-data")!.textContent =
    `document.cheatsheetInfo = ${JSON.stringify(spokenFormInfo)};`;

  await writeFile(outputPath, root.toString());
}
