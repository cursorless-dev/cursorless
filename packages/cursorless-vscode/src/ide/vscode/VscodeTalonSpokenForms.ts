import { Disposable, FileSystem, Notifier } from "@cursorless/common";
import { readFile } from "fs/promises";

import {
  NeedsInitialTalonUpdateError,
  SpokenFormEntry,
  TalonSpokenForms,
} from "@cursorless/cursorless-engine";
import * as path from "path";

interface TalonSpokenFormsPayload {
  version: number;
  spokenForms: SpokenFormEntry[];
}

const LATEST_SPOKEN_FORMS_JSON_VERSION = 0;

export class VscodeTalonSpokenForms implements TalonSpokenForms {
  private disposable: Disposable;
  private notifier = new Notifier();

  constructor(private fileSystem: FileSystem) {
    this.disposable = this.fileSystem.watchDir(
      path.dirname(this.fileSystem.cursorlessTalonStateJsonPath),
      () => this.notifier.notifyListeners(),
    );
  }

  /**
   * Registers a callback to be run when the spoken forms change.
   * @param callback The callback to run when the scope ranges change
   * @returns A {@link Disposable} which will stop the callback from running
   */
  onDidChange = this.notifier.registerListener;

  async getSpokenFormEntries(): Promise<SpokenFormEntry[]> {
    let payload: TalonSpokenFormsPayload;
    try {
      payload = JSON.parse(
        await readFile(this.fileSystem.cursorlessTalonStateJsonPath, "utf-8"),
      );
    } catch (err) {
      if (isErrnoException(err) && err.code === "ENOENT") {
        throw new NeedsInitialTalonUpdateError(
          `Custom spoken forms file not found at ${this.fileSystem.cursorlessTalonStateJsonPath}. Using default spoken forms.`,
        );
      }

      throw err;
    }

    if (payload.version !== LATEST_SPOKEN_FORMS_JSON_VERSION) {
      // In the future, we'll need to handle migrations. Not sure exactly how yet.
      throw new Error(
        `Invalid spoken forms version. Expected ${LATEST_SPOKEN_FORMS_JSON_VERSION} but got ${payload.version}`,
      );
    }

    return payload.spokenForms;
  }

  dispose() {
    this.disposable.dispose();
  }
}

/**
 * A user-defined type guard function that checks if a given error is a
 * `NodeJS.ErrnoException`.
 *
 * @param {any} error - The error to check.
 * @returns {error is NodeJS.ErrnoException} - Returns `true` if the error is a
 * {@link NodeJS.ErrnoException}, otherwise `false`.
 */
function isErrnoException(error: any): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
