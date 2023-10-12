import { Disposable, FileSystem, PathChangeListener } from "@cursorless/common";
import { RelativePattern, Uri, workspace } from "vscode";

export class VscodeFileSystem implements FileSystem {
  watchDir(path: string, onDidChange: PathChangeListener): Disposable {
    // FIXME: Support globs?
    const watcher = workspace.createFileSystemWatcher(
      new RelativePattern(Uri.file(path), "**"),
    );
    watcher.onDidChange(onDidChange);
    watcher.onDidCreate(onDidChange);
    watcher.onDidDelete(onDidChange);
    return watcher;
  }
}
