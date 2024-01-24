import { Disposable } from "./ide.types";

export type PathChangeListener = () => void;

export interface FileSystem {
  /**
   * Joins two path components.
   *
   * @param path1 a path component
   * @param path2 another path component
   * @returns The path components joined with the filesystem's directory
   *   separator.
   */
  join(path1: string, path2: string): string;

  /**
   * Removes the final component from a path.
   *
   * @param path A path.
   */
  dirname(path: string): string;

  /**
   * Reads a file that comes bundled with Cursorless, with the utf-8 encoding.
   * Note that in development mode, it is possible to supply an absolute path to
   * a file on the local filesystem, for things like hot-reloading.
   *
   * @param path The path of the file to read
   * @returns The contents of path, decoded as UTF-8
   */
  readBundledFile(path: string): Promise<string>;

  /**
   * Recursively watch a directory for changes.
   * @param path The path of the directory to watch
   * @param onDidChange A function to call on changes
   * @returns A disposable to cancel the watcher
   */
  watchDir(path: string, onDidChange: PathChangeListener): Disposable;

  /**
   * The path to the directory that Cursorless talon uses to share its state
   * with the Cursorless engine.
   */
  readonly cursorlessDir: string;

  /**
   * The path to the Cursorless talon state JSON file.
   */
  readonly cursorlessTalonStateJsonPath: string;

  /**
   * The path to the Cursorless command history directory.
   */
  readonly cursorlessCommandHistoryDirPath: string;
}
