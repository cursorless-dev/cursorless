import {
  DisabledCustomSpokenFormsError,
  type SpokenFormEntry,
  type TalonSpokenForms,
} from "@cursorless/common";

export class DisabledTalonSpokenForms implements TalonSpokenForms {
  getSpokenFormEntries(): Promise<SpokenFormEntry[]> {
    throw new DisabledCustomSpokenFormsError();
  }

  onDidChange() {
    return { dispose: () => {} };
  }
}
