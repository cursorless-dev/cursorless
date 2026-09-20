import { parse, TextNode } from "node-html-parser";
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

  root
    .getElementById("cheatsheet-data")!
    .set_content(
      new TextNode(`document.cheatsheetInfo = ${serializedCheatsheetInfo};`),
    );

  return root.toString();
}
