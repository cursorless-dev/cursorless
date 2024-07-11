import type { TalonSpokenForms } from "../scopeProviders/TalonSpokenForms";

export class DisabledTalonSpokenForms implements TalonSpokenForms {
  getSpokenFormEntries() {
    return Promise.resolve(null);
  }

  onDidChange() {
    return { dispose: () => {} };
  }
}
