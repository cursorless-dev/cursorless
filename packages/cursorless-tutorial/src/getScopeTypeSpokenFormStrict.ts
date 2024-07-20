import { ScopeType } from "@cursorless/common";
import { CustomSpokenFormGenerator } from "@cursorless/cursorless-engine";
import { getSpokenFormStrict } from "./getSpokenFormStrict";

export function getScopeTypeSpokenFormStrict(
  customSpokenFormGenerator: CustomSpokenFormGenerator,
  scopeType: ScopeType,
) {
  return getSpokenFormStrict(
    customSpokenFormGenerator.scopeTypeToSpokenForm(scopeType),
  );
}
