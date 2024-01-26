import {
  ScopeType,
  camelCaseToAllDown,
  isSimpleScopeType,
} from "@cursorless/common";

export function scopeTypeToString(scopeType: ScopeType): string {
  if (isSimpleScopeType(scopeType)) {
    return camelCaseToAllDown(scopeType.type).replace(".", " ");
  }

  if (scopeType.type === "surroundingPair") {
    return `Matching pair of ${camelCaseToAllDown(scopeType.delimiter)}`;
  }

  if (scopeType.type === "customRegex") {
    return `Regex \`${scopeType.regex}\``;
  }

  return "Unknown scope type";
}
