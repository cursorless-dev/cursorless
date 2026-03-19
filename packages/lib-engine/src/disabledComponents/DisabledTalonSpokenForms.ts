import type { SpokenFormEntry, TalonSpokenForms } from "@cursorless/common";
import { DisabledCustomSpokenFormsError } from "@cursorless/common";

export class DisabledTalonSpokenForms implements TalonSpokenForms {
  getSpokenFormEntries(): Promise<SpokenFormEntry[]> {
    throw new DisabledCustomSpokenFormsError();
  }

  onDidChange() {
    return { dispose: () => {} };
  }
}
