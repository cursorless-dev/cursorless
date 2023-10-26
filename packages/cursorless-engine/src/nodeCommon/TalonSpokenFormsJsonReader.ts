import { Disposer, FileSystem, Notifier } from "@cursorless/common";
import { mkdir, readFile } from "fs/promises";

import * as path from "path";
import {
  NeedsInitialTalonUpdateError,
  SpokenFormEntry,
  TalonSpokenForms,
} from "../scopeProviders/SpokenFormEntry";

interface TalonSpokenFormsPayload {
  version: number;
  spokenForms: SpokenFormEntry[];
}

const LATEST_SPOKEN_FORMS_JSON_VERSION = 0;

export class TalonSpokenFormsJsonReader implements TalonSpokenForms {
  private disposer = new Disposer();
  private notifier = new Notifier();
  private cursorlessTalonStateJsonPath;

  constructor(private fileSystem: FileSystem) {
    this.cursorlessTalonStateJsonPath = fileSystem.cursorlessTalonStateJsonPath;

    this.init();
  }

  private async init() {
    const parentDir = path.dirname(this.cursorlessTalonStateJsonPath);
    await mkdir(parentDir, { recursive: true });
    this.disposer.push(
      this.fileSystem.watchDir(parentDir, () =>
        this.notifier.notifyListeners(),
      ),
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
        await readFile(this.cursorlessTalonStateJsonPath, "utf-8"),
      );
    } catch (err) {
      if (isErrnoException(err) && err.code === "ENOENT") {
        throw new NeedsInitialTalonUpdateError(
          `Custom spoken forms file not found at ${this.cursorlessTalonStateJsonPath}. Using default spoken forms.`,
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
    this.disposer.dispose();
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
