import { Disposable, FileSystem, PathChangeListener } from "@cursorless/common";
import { TextDecoder } from "util";
import * as vscode from "vscode";

export class VscodeFileSystem implements FileSystem {
  public readonly cursorlessTalonStateJsonPath: string;
  public readonly cursorlessCommandHistoryDirPath: string;
  public readonly cursorlessDir: string;

  private decoder: TextDecoder = new TextDecoder("utf-8");

  constructor(
    private readonly extensionContext: vscode.ExtensionContext,
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
    // TODO: Look into whether we can use joinPath(...).path. The
    // question is whether Uri will correctly remove the Uri.base's path
    // from the returned path.
    return `${path1}/${path2}`;
  }

  public dirname(path: string): string {
    return path.substring(0, path.lastIndexOf("/"));
  }

  /**
   * Reads a file under the extensionUri of the extensionContext passed to
   * the constructor.
   *
   * @param path path to read
   * @returns the contents of path, decoded as UTF-8
   */
  public async readFileUtf8FromRoot(path: string): Promise<string> {
    return this.decoder.decode(
      await vscode.workspace.fs.readFile(
        vscode.Uri.joinPath(this.extensionContext.extensionUri, path),
      ),
    );
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
