import type { Disposable } from "./ide.types";

export type PathChangeListener = () => void;

export interface FileSystem {
  /**
   * Recursively watch a directory for changes.
   * @param path The path of the directory to watch
   * @param onDidChange A function to call on changes
   * @returns A disposable to cancel the watcher
   */
  watchDir(path: string, onDidChange: PathChangeListener): Disposable;
}
