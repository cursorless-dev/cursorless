import { Disposer, FileSystem, Notifier, isTesting } from "@cursorless/common";
import * as crypto from "crypto";
import { mkdir, readFile } from "fs/promises";
import * as os from "os";

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
  public readonly spokenFormsPath;

  constructor(private fileSystem: FileSystem) {
    const cursorlessDir = isTesting()
      ? path.join(os.tmpdir(), crypto.randomBytes(16).toString("hex"))
      : path.join(os.homedir(), ".cursorless");

    this.spokenFormsPath = path.join(cursorlessDir, "state.json");

    this.init();
  }

  private async init() {
    const parentDir = path.dirname(this.spokenFormsPath);
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
      payload = JSON.parse(await readFile(this.spokenFormsPath, "utf-8"));
    } catch (err) {
      if ((err as any)?.code === "ENOENT") {
        throw new NeedsInitialTalonUpdateError(
          `Custom spoken forms file not found at ${this.spokenFormsPath}. Using default spoken forms.`,
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
