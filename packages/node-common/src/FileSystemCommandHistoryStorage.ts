import type {
  CommandHistoryEntry,
  CommandHistoryStorage,
} from "@cursorless/common";
import { glob } from "glob";
import * as fs from "node:fs/promises";
import * as path from "node:path";

export class FileSystemCommandHistoryStorage implements CommandHistoryStorage {
  constructor(private dir: string) {}

  async appendEntry(
    fileName: string,
    entry: CommandHistoryEntry,
  ): Promise<void> {
    const data = JSON.stringify(entry) + "\n";
    const file = path.join(this.dir, fileName);
    await fs.mkdir(this.dir, { recursive: true });
    await fs.appendFile(file, data, "utf8");
  }

  async getEntries(): Promise<CommandHistoryEntry[]> {
    const files = await glob("*.jsonl", {
      cwd: this.dir,
    });

    const entries: CommandHistoryEntry[] = [];

    for (const file of files) {
      const filePath = path.join(this.dir, file);
      const content = await fs.readFile(filePath, "utf8");
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
}
