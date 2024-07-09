import type { CommandServerApi, FileSystem, IDE } from "@cursorless/common";
import { CommandHistory } from "@cursorless/cursorless-engine";

import * as fs from "node:fs/promises";
import * as path from "node:path";

export class VscodeCommandHistory extends CommandHistory {
  constructor(
    ide: IDE,
    commandServerApi: CommandServerApi | null,
    private fileSystem: FileSystem,
  ) {
    super(ide, commandServerApi);
  }

  protected async appendFile(fileName: string, data: string): Promise<void> {
    const dir = this.fileSystem.cursorlessCommandHistoryDirPath;
    const file = path.join(dir, fileName);
    await fs.mkdir(dir, { recursive: true });
    await fs.appendFile(file, data, "utf8");
  }
}
