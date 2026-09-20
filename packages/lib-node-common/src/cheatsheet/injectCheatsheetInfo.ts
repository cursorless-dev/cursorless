import { parse } from "node-html-parser";
import type { CheatsheetInfo } from "@cursorless/lib-common";

export function injectCheatsheetInfo(
  cheatsheetContent: string,
  cheatsheetInfo: CheatsheetInfo,
): string {
  const root = parse(cheatsheetContent);
  const serializedCheatsheetInfo = JSON.stringify(cheatsheetInfo).replaceAll(
    "<",
    String.raw`\u003c`,
  );

  const dataElement = root.getElementById("cheatsheet-data");

  if (dataElement == null) {
    throw new Error("Cheatsheet cheatsheet-data element not found");
  }

  dataElement.set_content(
    `document.cheatsheetInfo = ${serializedCheatsheetInfo};`,
  );

  return root.toString();
}
