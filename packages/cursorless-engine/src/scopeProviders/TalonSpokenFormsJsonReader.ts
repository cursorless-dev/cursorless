import {
  Disposer,
  FileSystem,
  LATEST_VERSION,
  Notifier,
  isTesting,
} from "@cursorless/common";
import * as crypto from "crypto";
import { mkdir, readFile } from "fs/promises";
import * as os from "os";

import * as path from "path";
import {
  NeedsInitialTalonUpdateError,
  SpokenFormEntry,
  TalonSpokenForms,
} from "./SpokenFormEntry";

interface TalonSpokenFormsPayload {
  version: number;
  entries: SpokenFormEntry[];
}

export class TalonSpokenFormsJsonReader implements TalonSpokenForms {
  private disposer = new Disposer();
  private notifier = new Notifier();
  public readonly spokenFormsPath;

  constructor(private fileSystem: FileSystem) {
    const cursorlessDir = isTesting()
      ? path.join(os.tmpdir(), crypto.randomBytes(16).toString("hex"))
      : path.join(os.homedir(), ".cursorless");

    this.spokenFormsPath = path.join(cursorlessDir, "spokenForms.json");

    this.init();
  }

  private async init() {
    const parentDir = path.dirname(this.spokenFormsPath);
    await mkdir(parentDir, { recursive: true });
    this.disposer.push(
      this.fileSystem.watch(parentDir, () => this.notifier.notifyListeners()),
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

    /**
     * This assignment is to ensure that the compiler will error if we forget to
     * handle spokenForms.json when we bump the command version.
     */
    const latestCommandVersion: 6 = LATEST_VERSION;

    if (payload.version !== latestCommandVersion) {
      // In the future, we'll need to handle migrations. Not sure exactly how yet.
      throw new Error(
        `Invalid spoken forms version. Expected ${LATEST_VERSION} but got ${payload.version}`,
      );
    }

    return payload.entries;
  }

  dispose() {
    this.disposer.dispose();
  }
}
