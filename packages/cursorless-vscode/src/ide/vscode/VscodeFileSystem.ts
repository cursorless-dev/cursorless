import type {
  Disposable,
  FileSystem,
  PathChangeListener,
  RunMode,
} from "@cursorless/common";
import { isAbsolute, join } from "node:path";
import * as vscode from "vscode";

export class VscodeFileSystem implements FileSystem {
  public readonly cursorlessTalonStateJsonPath: string;
  public readonly cursorlessCommandHistoryDirPath: string;

  private decoder = new TextDecoder("utf-8");

  constructor(
    private readonly extensionContext: vscode.ExtensionContext,
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
    try {
      await vscode.workspace.fs.createDirectory(
        vscode.Uri.file(this.cursorlessDir),
      );
    } catch (err) {
      console.log("Cannot create cursorlessDir", this.cursorlessDir, err);
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
    } catch (err) {
      if (
        err instanceof Error &&
        "code" in err &&
        err.code === "FileNotFound"
      ) {
        return undefined;
      }
      throw err;
    }
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
