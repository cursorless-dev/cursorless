import type { SpokenForm } from "@cursorless/common";
import { TutorialError } from "./TutorialError";

export function getSpokenFormStrict(spokenForm: SpokenForm) {
  if (spokenForm.type === "error") {
    throw new TutorialError(
      `Error while processing spoken form for scope type: ${spokenForm.reason}`,
      { requiresTalonUpdate: spokenForm.requiresTalonUpdate },
    );
  }

  return spokenForm.spokenForms[0];
}
