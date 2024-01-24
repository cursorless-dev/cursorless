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
   * Reads a file from a path.
   *
   * @param path The path of the file to read.  If path is relative, it is
   *    read from under a pre-configured root location.  If it is absolute,
   *    it is read from that location.
   * @returns The contents of the file as as string, decoded as UTF-8.
   */
  readFileUtf8FromRoot(path: string): Promise<string>;

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
