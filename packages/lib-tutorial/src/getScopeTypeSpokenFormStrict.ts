import type { ScopeType } from "@cursorless/lib-common";
import type { CustomSpokenFormGenerator } from "@cursorless/lib-engine";
import { getSpokenFormStrict } from "./getSpokenFormStrict";

export function getScopeTypeSpokenFormStrict(
  customSpokenFormGenerator: CustomSpokenFormGenerator,
  scopeType: ScopeType,
) {
  return getSpokenFormStrict(
    customSpokenFormGenerator.scopeTypeToSpokenForm(scopeType),
  );
}
