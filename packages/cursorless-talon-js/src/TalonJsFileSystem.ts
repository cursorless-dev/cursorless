import type {
  Disposable,
  FileSystem,
  PathChangeListener,
} from "@cursorless/common";

export class TalonJsFileSystem implements FileSystem {
  get cursorlessTalonStateJsonPath(): string {
    throw new Error("cursorlessTalonStateJsonPath not implemented.");
  }

  get cursorlessTalonStateJsonDirPath(): string {
    throw new Error("cursorlessTalonStateJsonDirPath not implemented.");
  }

  get cursorlessCommandHistoryDirPath(): string {
    throw new Error("cursorlessCommandHistoryDirPath not implemented.");
  }

  readBundledFile(_path: string): Promise<string | undefined> {
    throw new Error("readBundledFile not implemented.");
  }

  watchDir(_path: string, _onDidChange: PathChangeListener): Disposable {
    throw new Error("watchDir not implemented.");
  }

  readFile(_path: string): Promise<string> {
    throw new Error("readFile not implemented.");
  }
}
