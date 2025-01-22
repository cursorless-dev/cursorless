import type { SnippetMap } from "@cursorless/common";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { VscodeSnippets } from "./VscodeSnippets";

export async function migrateSnippets(snippets: VscodeSnippets, dir: string) {
  console.log("migrateSnippets");
  console.log(dir);
  const userSnippetsDir = snippets.getUserDirectoryStrict();
  const files = await snippets.getSnippetPaths(userSnippetsDir);

  for (const file of files) {
    await migrateFile(file);
  }
}

async function migrateFile(filePath: string) {
  const fileName = path.basename(filePath, ".cursorless-snippets");
  const snippetFile = await readFile(filePath);

  console.log(fileName);
  console.log(snippetFile);
}

async function readFile(filePath: string): Promise<SnippetMap> {
  const content = await fs.readFile(filePath, "utf8");
  if (content.length === 0) {
    return {};
  }
  return JSON.parse(content);
}
