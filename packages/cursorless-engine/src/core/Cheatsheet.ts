import { readFile, writeFile } from "fs/promises";
import { parse } from "node-html-parser";
import { sortBy } from "lodash-es";
import { ide } from "../singletons/ide.singleton";
import path from "pathe";
import { getCursorlessRepoRoot } from "@cursorless/common";
import { produce } from "immer";

/**
 * The argument expected by the cheatsheet command.
 */
interface CheatSheetCommandArg {
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

export async function showCheatsheet({
  version,
  spokenFormInfo,
  outputPath,
}: CheatSheetCommandArg) {
  if (version !== 0) {
    throw new Error(`Unsupported cheatsheet api version: ${version}`);
  }

  const cheatsheetPath = path.join(ide().assetsRoot, "cheatsheet.html");

  const cheatsheetContent = (await readFile(cheatsheetPath)).toString();

  const root = parse(cheatsheetContent);

  root.getElementById("cheatsheet-data")!.textContent =
    `document.cheatsheetInfo = ${JSON.stringify(spokenFormInfo)};`;

  await writeFile(outputPath, root.toString());
}

/**
 * Updates the default spoken forms stored in `defaults.json` for
 * development.
 * @param spokenFormInfo The new value to use for default spoken forms.
 */
export async function updateDefaults(spokenFormInfo: CheatsheetInfo) {
  const defaultsPath = path.join(
    getCursorlessRepoRoot(),
    "packages/cheatsheet/src/lib/sampleSpokenFormInfos/defaults.json",
  );

  const outputObject = produce(spokenFormInfo, (draft) => {
    draft.sections = sortBy(draft.sections, "id");
    draft.sections.forEach((section) => {
      section.items = sortBy(section.items, "id");
    });
  });

  await writeFile(defaultsPath, JSON.stringify(outputObject, null, 2) + "\n");
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
