import type { ScopeType } from "@cursorless/lib-common";
import { camelCaseToAllDown, scopeReferences } from "@cursorless/lib-common";

export function scopeTypeToString(scopeType: ScopeType): string {
  if (scopeType.type === "surroundingPair") {
    return `Matching pair of ${camelCaseToAllDown(scopeType.delimiter)}`;
  }

  if (scopeType.type === "customRegex") {
    return `Regex \`${scopeType.regex}\``;
  }

  return scopeReferences[scopeType.type].name;
}
