import { CommandHistoryEntry } from "@cursorless/common";
import { analyzeCommandHistory } from "@cursorless/cursorless-engine";
import { glob } from "glob";
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function analyzeVscodeCommandHistory(dir: string) {
  const entries = await getCommandHistoryEntries(dir);
  await analyzeCommandHistory(entries);
}

async function getCommandHistoryEntries(dir: string) {
  const files = await glob("*.jsonl", { cwd: dir });

  const entries: CommandHistoryEntry[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const content = await readFile(filePath, "utf8");
    const lines = content.split("\n");

    for (const line of lines) {
      if (line.length === 0) {
        continue;
      }

      entries.push(JSON.parse(line));
    }
  }

  return entries;
}
