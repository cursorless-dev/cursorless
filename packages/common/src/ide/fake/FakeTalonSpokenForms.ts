import {
  NeedsInitialTalonUpdateError,
  type SpokenFormEntry,
  type TalonSpokenForms,
} from "../../types/TalonSpokenForms";
import { Notifier } from "../../util/Notifier";

export class FakeTalonSpokenForms implements TalonSpokenForms {
  private notifier = new Notifier();
  private entries: SpokenFormEntry[] | null = null;

  async getSpokenFormEntries(): Promise<SpokenFormEntry[]> {
    if (this.entries == null) {
      throw new NeedsInitialTalonUpdateError("FakeTalonSpokenForms");
    }
    return this.entries;
  }

  onDidChange = this.notifier.registerListener;

  mockSpokenFormEntries(entries: SpokenFormEntry[] | null): void {
    this.entries = entries;
    this.notifier.notifyListeners();
  }
}
