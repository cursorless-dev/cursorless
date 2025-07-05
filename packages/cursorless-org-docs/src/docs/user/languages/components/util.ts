import {
  camelCaseToAllDown,
  capitalize,
  scopeSupportFacetInfos,
  textualScopeSupportFacetInfos,
  type ScopeSupportFacet,
  type ScopeSupportFacetInfo,
  type ScopeType,
  type SimpleScopeTypeType,
  type TextualScopeSupportFacet,
} from "@cursorless/common";

export function prettifyFacet(
  facet: ScopeSupportFacet | TextualScopeSupportFacet,
  keepScopeType: boolean,
): string {
  let parts = facet.split(".").map(camelCaseToAllDown);
  if (parts.length === 1) {
    return capitalize(parts[0]);
  }
  const iterationIndex = parts.indexOf("iteration");
  let iterationParts: string[] = [];
  if (iterationIndex > 0) {
    iterationParts = parts.slice(iterationIndex);
    parts = parts.slice(0, iterationIndex);
    parts.length = iterationIndex;
  }
  const scopeName = parts.shift()!;
  let name = capitalize(parts.join(" "));
  if (keepScopeType) {
    name = capitalize(scopeName) + (parts.length > 0 ? ": " : " ") + name;
  }
  if (iterationParts.length > 0) {
    name += ` (${iterationParts.join(" ")})`;
  }
  return name;
}

export function serializeScopeType(
  scopeType: SimpleScopeTypeType | ScopeType,
): string {
  if (typeof scopeType === "string") {
    return scopeType;
  }
  return scopeType.type;
}

export function prettifyScopeType(scopeType: string): string {
  return capitalize(camelCaseToAllDown(scopeType));
}

export function getFacetInfo(
  languageId: string,
  facetId: ScopeSupportFacet | TextualScopeSupportFacet,
): ScopeSupportFacetInfo {
  const facetInfo =
    languageId === "textual"
      ? textualScopeSupportFacetInfos[facetId as TextualScopeSupportFacet]
      : scopeSupportFacetInfos[facetId as ScopeSupportFacet];

  if (facetInfo == null) {
    throw Error(`Missing scope support facet info for: ${facetId}`);
  }

  return facetInfo;
}
