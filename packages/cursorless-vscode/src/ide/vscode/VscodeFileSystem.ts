import { Disposable, FileSystem, PathChangeListener } from "@cursorless/common";
import { RelativePattern, Uri, workspace } from "vscode";

export class VscodeFileSystem implements FileSystem {
  watch(path: string, onDidChange: PathChangeListener): Disposable {
    console.log(`path: ${path}`);
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
