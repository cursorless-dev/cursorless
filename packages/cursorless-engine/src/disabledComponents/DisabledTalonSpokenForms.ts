import type {
  SpokenFormEntry,
  TalonSpokenForms,
} from "../scopeProviders/TalonSpokenForms";

export class DisabledTalonSpokenForms implements TalonSpokenForms {
  getSpokenFormEntries(): Promise<SpokenFormEntry[]> {
    throw Error("Talon spoken forms are not implemented.");
  }

  onDidChange() {
    return { dispose: () => {} };
  }
}
