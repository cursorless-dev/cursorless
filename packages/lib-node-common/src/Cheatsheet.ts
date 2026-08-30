import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "node-html-parser";
import type { IDE } from "@cursorless/lib-common";

/**
 * The argument expected by the cheatsheet command.
 */
export interface CheatSheetCommandArg {
  /**
   * The version of the cheatsheet command.
   */
  version: 0;

  /**
   * A representation of all spoken forms that is used to generate the
   * cheatsheet.
   */
  spokenFormInfo: CheatsheetInfo;

  /**
   * The file to write the cheatsheet to
   */
  outputPath: string;
}

export async function showCheatsheet(
  ide: IDE,
  { version, spokenFormInfo, outputPath }: CheatSheetCommandArg,
) {
  if (version !== 0) {
    throw new Error(`Unsupported cheatsheet api version: ${version}`);
  }

  const cheatsheetPath = path.join(ide.assetsRoot, "cheatsheet.html");

  const cheatsheetContent = await readFile(cheatsheetPath, "utf8");

  const root = parse(cheatsheetContent);

  root.getElementById("cheatsheet-data")!.textContent =
    `document.cheatsheetInfo = ${JSON.stringify(spokenFormInfo)};`;

  await writeFile(outputPath, root.toString());
}

// FIXME: Stop duplicating these types once we have #945
// The source of truth is at /cursorless-nx/libs/cheatsheet/src/lib/CheatsheetInfo.tsx
interface Variation {
  spokenForm: string;
  description: string;
}

interface CheatsheetSection {
  name: string;
  id: string;
  items: {
    id: string;
    type: string;
    variations: Variation[];
  }[];
}

interface CheatsheetInfo {
  sections: CheatsheetSection[];
}
