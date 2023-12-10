import { readFile, writeFile } from "fs/promises";
import { parse } from "node-html-parser";
import produce from "immer";
import { sortBy } from "lodash";
import { ide } from "../singletons/ide.singleton";
import path from "path";
import { CheatsheetInfo } from "@cursorless/cheatsheet";

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
   * 
   * The command is called from talon and this is passed as one of the parameters.
   */
  spokenFormInfo: CheatsheetInfo;

  /**
   * The file to write the cheatsheet to
   */
  outputPath: string;
}

/**
 * Despite the name, does not show the cheatsheet. Instead, it updates the cheatsheet file.
 * I should read history of this file to understand why all of this was not done on talon side.
 * 
 * Usage stats will be collected extension side (source of truth for all things cursorless).
 */
export async function showCheatsheet({
  version,
  spokenFormInfo,
  outputPath,
}: CheatSheetCommandArg) {
  if (version !== 0) {
    throw new Error(`Unsupported cheatsheet api version: ${version}`);
  }

  // Appears to mismatch the linux path in the talon code
  const cheatsheetPath = path.join(ide().assetsRoot, "cheatsheet.html");

  const cheatsheetContent = (await readFile(cheatsheetPath)).toString();

  const root = parse(cheatsheetContent);

  // Add usage stats here option #2
  // Like ... document.cheatsheetUsageStats

  // Inject data into the cheatsheet
  root.getElementById(
    "cheatsheet-data",
  ).textContent = `document.cheatsheetInfo = ${JSON.stringify(
    spokenFormInfo,
  )};`;

  await writeFile(outputPath, root.toString());
}

/**
 * Updates the default spoken forms stored in `defaults.json` for
 * development.
 * @param spokenFormInfo The new value to use for default spoken forms.
 */
export async function updateDefaults(spokenFormInfo: CheatsheetInfo) {
  const { runMode, assetsRoot, workspaceFolders } = ide();

  const workspacePath =
    runMode === "development"
      ? assetsRoot
      : workspaceFolders?.[0].uri.path ?? null;

  if (workspacePath == null) {
    throw new Error(
      "Please update defaults from Cursorless workspace or running in debug",
    );
  }

  const defaultsPath = path.join(
    workspacePath,
    "packages",
    "cheatsheet",
    "src",
    "lib",
    "sampleSpokenFormInfos",
    "defaults.json",
  );

  const outputObject = produce(spokenFormInfo, (draft) => {
    draft.sections = sortBy(draft.sections, "id");
    draft.sections.forEach((section) => {
      section.items = sortBy(section.items, "id");
    });
  });

  await writeFile(defaultsPath, JSON.stringify(outputObject, null, "\t"));
}
