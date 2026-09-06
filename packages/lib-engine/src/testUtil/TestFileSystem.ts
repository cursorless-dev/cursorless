import fs from "node:fs/promises";
import path from "node:path";
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
    this.cursorlessTalonStateJsonPath = path.join(
      this.cursorlessDir,
      "state.json",
    );
    this.cursorlessCommandHistoryDirPath = path.join(
      this.cursorlessDir,
      "commandHistory",
    );
  }

  public initialize(): Promise<void> {
    return Promise.resolve();
  }

  public async readBundledFile(filePath: string): Promise<string | undefined> {
    const absolutePath = path.join(getCursorlessRepoRoot(), filePath);
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
