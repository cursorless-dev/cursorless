import { ScopeType } from "@cursorless/common";
import { CustomSpokenFormGeneratorImpl } from "../generateSpokenForm/CustomSpokenFormGeneratorImpl";
import { TutorialError } from "./TutorialError";

export function getScopeTypeSpokenFormStrict(
  customSpokenFormGenerator: CustomSpokenFormGeneratorImpl,
  scopeType: ScopeType,
) {
  const spokenForm = customSpokenFormGenerator.scopeTypeToSpokenForm(scopeType);

  if (spokenForm.type === "error") {
    throw new TutorialError(
      `Error while processing spoken form for scope type: ${spokenForm.reason}`,
      { requiresTalonUpdate: spokenForm.requiresTalonUpdate },
    );
  }

  return spokenForm.spokenForms[0];
}
