import type {
  TalonSpokenForms,
  TalonSpokenFormsPayload,
} from "@cursorless/lib-common";
import { DisabledCustomSpokenFormsError } from "@cursorless/lib-common";

export class DisabledTalonSpokenForms implements TalonSpokenForms {
  getSpokenForms(): Promise<TalonSpokenFormsPayload> {
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
