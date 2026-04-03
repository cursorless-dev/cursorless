import { readFile } from "node:fs/promises";
import * as path from "node:path";
import type {
  Disposable,
  FileSystem,
  Listener,
  SpokenFormEntry,
  TalonSpokenForms,
} from "@cursorless/lib-common";
import { NeedsInitialTalonUpdateError, Notifier } from "@cursorless/lib-common";
import { isEnoentError } from "./isError";

interface TalonSpokenFormsPayload {
  version: number;
  spokenForms: SpokenFormEntry[];
}

const LATEST_SPOKEN_FORMS_JSON_VERSION = 0;

export class FileSystemTalonSpokenForms implements TalonSpokenForms {
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
  onDidChange(listener: Listener) {
    return this.notifier.registerListener(listener);
  }

  async getSpokenFormEntries(): Promise<SpokenFormEntry[]> {
    let payload: TalonSpokenFormsPayload;
    try {
      payload = JSON.parse(
        await readFile(this.fileSystem.cursorlessTalonStateJsonPath, "utf8"),
      );
    } catch (error) {
      if (isEnoentError(error)) {
        throw new NeedsInitialTalonUpdateError(
          `Custom spoken forms file not found at ${this.fileSystem.cursorlessTalonStateJsonPath}. Using default spoken forms.`,
        );
      }

      throw error;
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
