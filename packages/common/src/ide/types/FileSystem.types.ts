import { Disposable } from "./ide.types";

export type PathChangeListener = () => void;

export interface FileSystem {
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
  readBundledFile(path: string): Promise<string | undefined>;

  /**
   * Recursively watch a directory for changes.
   * @param path The path of the directory to watch
   * @param onDidChange A function to call on changes
   * @returns A disposable to cancel the watcher
   */
  watchDir(path: string, onDidChange: PathChangeListener): Disposable;

  /**
   * The path to the Cursorless talon state JSON file.
   */
  readonly cursorlessTalonStateJsonPath: string;

  /**
   * The path to the Cursorless command history directory.
   */
  readonly cursorlessCommandHistoryDirPath: string;
}
