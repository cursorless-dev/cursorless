import { Disposable } from "./ide.types";

export type PathChangeListener = () => void;

export interface FileSystem {
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
}
