import path from "node:path";
import vscode from "vscode";
import type {
  Disposable,
  FileSystem,
  PathChangeListener,
  RunMode,
} from "@cursorless/lib-common";
import { isErrnoException } from "@cursorless/lib-node-common";

export class VscodeFileSystem implements FileSystem {
  public readonly cursorlessTalonStateJsonPath: string;
  public readonly cursorlessCommandHistoryDirPath: string;

  private decoder = new TextDecoder("utf-8");

  constructor(
    private readonly extensionContext: vscode.ExtensionContext,
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

  public async initialize(): Promise<void> {
    try {
      await vscode.workspace.fs.createDirectory(
        vscode.Uri.file(this.cursorlessDir),
      );
    } catch (error) {
      console.log("Cannot create cursorlessDir", this.cursorlessDir, error);
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
    try {
      return this.decoder.decode(
        await vscode.workspace.fs.readFile(this.resolveBundledPath(path)),
      );
    } catch (error) {
      if (isErrnoException(error) && error.code === "FileNotFound") {
        return undefined;
      }
      throw error;
    }
  }

  private resolveBundledPath(bundledPath: string) {
    if (path.isAbsolute(bundledPath)) {
      if (this.runMode !== "development") {
        throw new Error(
          "Absolute paths are not supported outside of development mode",
        );
      }

      return vscode.Uri.file(bundledPath);
    }

    return vscode.Uri.joinPath(this.extensionContext.extensionUri, bundledPath);
  }

  public watchDir(
    dirPath: string,
    onDidChange: PathChangeListener,
  ): Disposable {
    // FIXME: Support globs?
    const watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(dirPath, "**"),
    );

    watcher.onDidChange(onDidChange);
    watcher.onDidCreate(onDidChange);
    watcher.onDidDelete(onDidChange);

    return watcher;
  }
}
