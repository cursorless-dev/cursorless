import { CommandHistoryEntry } from "@cursorless/common";
import globRaw from "glob";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

export async function* generateCommandHistoryEntries(dir: string) {
  const files = await glob("*.jsonl", { cwd: dir });

  for (const file of files) {
    const filePath = path.join(dir, file);
    const content = await readFile(filePath, "utf8");
    const lines = content.split("\n");

    for (const line of lines) {
      if (line.length === 0) {
        continue;
      }

      yield JSON.parse(line) as CommandHistoryEntry;
    }
  }
}

const glob = promisify(globRaw);
