import {
  DisabledCustomSpokenFormsError,
  type SpokenFormEntry,
  type TalonSpokenForms,
} from "@cursorless/common";

export class DisabledTalonSpokenForms implements TalonSpokenForms {
  getSpokenFormEntries(): Promise<SpokenFormEntry[]> {
    console.log("getSpokenFormEntries() throw DisabledCustomSpokenFormsError");
    throw new DisabledCustomSpokenFormsError();
  }

  onDidChange() {
    return { dispose: () => {} };
  }
}
