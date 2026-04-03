import type { SpokenFormEntry, TalonSpokenForms } from "@cursorless/lib-common";
import { DisabledCustomSpokenFormsError } from "@cursorless/lib-common";

export class DisabledTalonSpokenForms implements TalonSpokenForms {
  getSpokenFormEntries(): Promise<SpokenFormEntry[]> {
    throw new DisabledCustomSpokenFormsError();
  }

  onDidChange() {
    return {
      dispose: () => {
        // No-op
      },
    };
  }
}
