import { Disposable } from "../ide/types/ide.types";

/**
 * Construct a disposable that disposes multiple disposables at once. This is
 * useful for managing the lifetime of multiple disposables that are created
 * together. It ensures that if one of the disposables throws an error during
 * disposal, the rest of the disposables will still be disposed.
 */
export function disposableFrom(...disposables: Disposable[]): Disposable {
  return {
    dispose(): void {
      disposables.forEach(({ dispose }) => {
        try {
          dispose();
        } catch (e) {
          // just log, but don't throw; some of the VSCode disposables misbehave,
          // and we don't want that to prevent us from disposing the rest of the
          // disposables
          console.error(e);
        }
      });
    },
  };
}
