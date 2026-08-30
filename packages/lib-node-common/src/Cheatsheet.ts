import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "node-html-parser";
import type { CheatsheetInfo, IDE } from "@cursorless/lib-common";

export async function showCheatsheet(
  ide: IDE,
  outputPath: string,
  cheatsheetInfo: CheatsheetInfo,
) {
  const cheatsheetPath = path.join(ide.assetsRoot, "cheatsheet.html");

  const cheatsheetContent = await readFile(cheatsheetPath, "utf8");

  const root = parse(cheatsheetContent);

  root.getElementById("cheatsheet-data")!.textContent =
    `document.cheatsheetInfo = ${JSON.stringify(cheatsheetInfo)};`;

  await writeFile(outputPath, root.toString());
}
