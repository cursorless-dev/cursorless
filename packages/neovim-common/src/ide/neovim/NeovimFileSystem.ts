import {
  Disposable,
  FileSystem,
  PathChangeListener,
  RunMode,
} from "@cursorless/common";
import { join } from "path";
import * as fs from "fs";

export class NeovimFileSystem implements FileSystem {
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

  public async initialize(): Promise<void> {
    if (!fs.existsSync(this.cursorlessDir)) {
      try {
        fs.mkdirSync(this.cursorlessDir);
      } catch (err) {
        console.log("Cannot create cursorlessDir", this.cursorlessDir, err);
      }
    }
  }

  /**
   * Reads a file that comes bundled with Cursorless, with the utf-8 encoding.
   * {@link path} is expected to be relative to the root of the extension
   * bundle. If the file doesn't exist, returns `undefined`.
   *
   * Note that in development mode, it is possible to supply an absolute path to
   * a file on the local filesystem, for things like hot-reloading.
   *
   * @param path The path of the file to read
   * @returns The contents of path, decoded as UTF-8
   */
  public async readBundledFile(path: string): Promise<string | undefined> {
    // throw Error("readBundledFile() Not implemented");
    console.log("readBundledFile() Not implemented");
    return undefined;
  }

  private resolveBundledPath(path: string) {
    throw Error("resolveBundledPath() Not implemented");
  }

  // TODO: track on github to implement watchDir and remove TODO
  public watchDir(path: string, onDidChange: PathChangeListener): Disposable {
    // throw Error("watchDir() Not implemented");
    // TODO: we need to implement this?
    return dummyEvent();
  }
}

function dummyEvent() {
  return {
    dispose() {
      // empty
    },
  };
}
