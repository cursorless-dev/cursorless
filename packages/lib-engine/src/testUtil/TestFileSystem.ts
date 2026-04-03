import fs from "node:fs/promises";
import { join } from "node:path";
import type {
  Disposable,
  FileSystem,
  PathChangeListener,
  RunMode,
} from "@cursorless/lib-common";
import {
  getCursorlessRepoRoot,
  isEnoentError,
} from "@cursorless/lib-node-common";

export class TestFileSystem implements FileSystem {
  public readonly cursorlessTalonStateJsonPath: string;
  public readonly cursorlessCommandHistoryDirPath: string;

  constructor(
    private readonly runMode: RunMode,
    private readonly cursorlessDir: string,
  ) {
    this.cursorlessTalonStateJsonPath = join(this.cursorlessDir, "state.json");
    this.cursorlessCommandHistoryDirPath = join(
      this.cursorlessDir,
      "commandHistory",
    );
  }

  public initialize(): Promise<void> {
    return Promise.resolve();
  }

  public async readBundledFile(path: string): Promise<string | undefined> {
    const absolutePath = join(getCursorlessRepoRoot(), path);
    try {
      return await fs.readFile(absolutePath, "utf8");
    } catch (error) {
      if (isEnoentError(error)) {
        return undefined;
      }
      throw error;
    }
  }

  public watchDir(_path: string, _onDidChange: PathChangeListener): Disposable {
    throw new Error("watchDir: not implemented.");
  }
}
