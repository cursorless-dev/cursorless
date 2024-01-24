import {
  Disposable,
  FileSystem,
  PathChangeListener,
  RunMode,
} from "@cursorless/common";
import { isAbsolute } from "path";
import { TextDecoder } from "util";
import * as vscode from "vscode";

export class VscodeFileSystem implements FileSystem {
  public readonly cursorlessTalonStateJsonPath: string;
  public readonly cursorlessCommandHistoryDirPath: string;
  public readonly cursorlessDir: string;

  private decoder: TextDecoder = new TextDecoder("utf-8");

  constructor(
    private readonly extensionContext: vscode.ExtensionContext,
    private readonly runMode: RunMode,
    cursorlessDirPath: string,
    cursorlessDirName: string,
  ) {
    this.cursorlessDir = this.join(cursorlessDirPath, cursorlessDirName);
    this.cursorlessTalonStateJsonPath = this.join(
      this.cursorlessDir,
      "state.json",
    );
    this.cursorlessCommandHistoryDirPath = this.join(
      this.cursorlessDir,
      "commandHistory",
    );
  }

  public async initialize(): Promise<void> {
    await vscode.workspace.fs.createDirectory(
      vscode.Uri.file(this.cursorlessDir),
    );
  }

  public join(path1: string, path2: string): string {
    // FIXME: Look into whether we can use joinPath(...).path. The
    // question is whether Uri will correctly remove the Uri.base's path
    // from the returned path.
    return `${path1}/${path2}`;
  }

  public dirname(path: string): string {
    return path.substring(0, path.lastIndexOf("/"));
  }

  /**
   * Reads a file that comes bundled with Cursorless, with the utf-8 encoding.
   * Note that in development mode, it is possible to supply an absolute path to
   * a file on the local filesystem, for things like hot-reloading.
   *
   * @param path The path of the file to read
   * @returns The contents of path, decoded as UTF-8
   */
  public async readBundledFile(path: string): Promise<string> {
    return this.decoder.decode(
      await vscode.workspace.fs.readFile(this.resolveBundledPath(path)),
    );
  }

  private resolveBundledPath(path: string) {
    if (isAbsolute(path)) {
      if (this.runMode !== "development") {
        throw new Error(
          "Absolute paths are not supported outside of development mode",
        );
      }

      return vscode.Uri.file(path);
    }

    return vscode.Uri.joinPath(this.extensionContext.extensionUri, path);
  }

  public watchDir(path: string, onDidChange: PathChangeListener): Disposable {
    // return { dispose: () => {} };
    // FIXME: Support globs?
    const watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(path, "**"),
    );

    watcher.onDidChange(onDidChange);
    watcher.onDidCreate(onDidChange);
    watcher.onDidDelete(onDidChange);

    return watcher;
  }
}
