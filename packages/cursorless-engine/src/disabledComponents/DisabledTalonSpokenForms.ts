import {
  DisabledSpokenFormsError,
  type SpokenFormEntry,
  type TalonSpokenForms,
} from "@cursorless/common";

export class DisabledTalonSpokenForms implements TalonSpokenForms {
  getSpokenFormEntries(): Promise<SpokenFormEntry[]> {
    throw new DisabledSpokenFormsError();
  }

  onDidChange() {
    return { dispose: () => {} };
  }
}
