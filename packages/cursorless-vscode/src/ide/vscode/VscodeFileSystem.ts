import { Disposable, FileSystem, PathChangeListener } from "@cursorless/common";
import { RelativePattern, workspace } from "vscode";
import * as path from "path";

export class VscodeFileSystem implements FileSystem {
  public readonly cursorlessTalonStateJsonPath: string;

  constructor(public readonly cursorlessDir: string) {
    this.cursorlessTalonStateJsonPath = path.join(
      this.cursorlessDir,
      "state.json",
    );
  }

  watchDir(path: string, onDidChange: PathChangeListener): Disposable {
    // FIXME: Support globs?
    const watcher = workspace.createFileSystemWatcher(
      new RelativePattern(path, "**"),
    );

    watcher.onDidChange(onDidChange);
    watcher.onDidCreate(onDidChange);
    watcher.onDidDelete(onDidChange);

    return watcher;
  }
}
