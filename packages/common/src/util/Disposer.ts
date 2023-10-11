import { Disposable } from "../ide/types/ide.types";

/**
 * A class that can be used to dispose of multiple disposables at once. This is
 * useful for managing the lifetime of multiple disposables that are created
 * together. It ensures that if one of the disposables throws an error during
 * disposal, the rest of the disposables will still be disposed.
 */
export class Disposer implements Disposable {
  private disposables: Disposable[] = [];

  constructor(...disposables: Disposable[]) {
    this.push(...disposables)
  }

  public push(...disposables: Disposable[]) {
    this.disposables.push(...disposables);
  }

  dispose(): void {
    this.disposables.forEach(({ dispose }) => {
      try {
        dispose();
      } catch (e) {
        // do nothing; some of the VSCode disposables misbehave, and we don't
        // want that to prevent us from disposing the rest of the disposables
      }
    });
  }
}
