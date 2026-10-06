import { readFile } from "node:fs/promises";
import path from "node:path";
import type {
  Disposable,
  FileSystem,
  Listener,
  TalonSpokenForms,
  TalonSpokenFormsPayload,
} from "@cursorless/lib-common";
import { NeedsInitialTalonUpdateError, Notifier } from "@cursorless/lib-common";
import { isEnoentError } from "./isError";

const LATEST_SPOKEN_FORMS_JSON_VERSION = 1;

export class FileSystemTalonSpokenForms implements TalonSpokenForms {
  private disposable: Disposable;
  private notifier = new Notifier();
  private payloadPromise?: Promise<TalonSpokenFormsPayload>;

  constructor(private fileSystem: FileSystem) {
    this.disposable = this.fileSystem.watchDir(
      path.dirname(this.fileSystem.cursorlessTalonStateJsonPath),
      () => {
        this.payloadPromise = undefined;
        this.notifier.notifyListeners();
      },
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

  async getSpokenForms(): Promise<TalonSpokenFormsPayload> {
    if (this.payloadPromise != null) {
      return this.payloadPromise;
    }
    const promise = this.readStateFile();
    this.payloadPromise = promise;
    try {
      return await promise;
    } catch (error) {
      if (this.payloadPromise === promise) {
        this.payloadPromise = undefined;
      }
      throw error;
    }
  }

  dispose() {
    this.disposable.dispose();
  }

  private async readStateFile(): Promise<TalonSpokenFormsPayload> {
    let payload: TalonSpokenFormsPayload;
    try {
      const stateFileContent = await readFile(
        this.fileSystem.cursorlessTalonStateJsonPath,
        "utf8",
      );
      payload = JSON.parse(stateFileContent);
    } catch (error) {
      if (isEnoentError(error)) {
        throw new NeedsInitialTalonUpdateError(
          `Custom spoken forms file not found at ${this.fileSystem.cursorlessTalonStateJsonPath}. Using default spoken forms.`,
        );
      }

      throw error;
    }

    if (payload.version > LATEST_SPOKEN_FORMS_JSON_VERSION) {
      throw new Error(
        `Unsupported spoken forms version ${payload.version}. Supported versions: 0-${LATEST_SPOKEN_FORMS_JSON_VERSION}`,
      );
    }

    return payload;
  }
}
