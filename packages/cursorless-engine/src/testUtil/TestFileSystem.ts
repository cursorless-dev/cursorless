import type {
  Disposable,
  FileSystem,
  PathChangeListener,
  RunMode,
} from "@cursorless/common";
import { getCursorlessRepoRoot } from "@cursorless/node-common";
import { join } from "node:path";
import fs from "node:fs/promises";

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

  public async initialize(): Promise<void> {}

  public async readBundledFile(path: string): Promise<string | undefined> {
    const absolutePath = join(getCursorlessRepoRoot(), path);
    try {
      return fs.readFile(absolutePath, "utf-8");
    } catch (e) {
      if (e instanceof Error && "code" in e && e.code === "ENOENT") {
        return undefined;
      }
      throw e;
    }
  }

  public watchDir(_path: string, _onDidChange: PathChangeListener): Disposable {
    throw new Error("watchDir: not implemented.");
  }
}
