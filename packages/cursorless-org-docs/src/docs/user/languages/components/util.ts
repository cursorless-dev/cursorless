import {
  camelCaseToAllDown,
  capitalize,
  plaintextScopeSupportFacetInfos,
  scopeSupportFacetInfos,
  serializeScopeType,
  type PlaintextScopeSupportFacet,
  type ScopeSupportFacet,
  type ScopeSupportFacetInfo,
  type ScopeType,
  type SimpleScopeTypeType,
} from "@cursorless/common";

export function prettifyFacet(
  facet: ScopeSupportFacet | PlaintextScopeSupportFacet,
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
  const trailing = capitalize(parts.join(" "));
  let name =
    capitalize(scopeName) + (trailing.length > 0 ? ": " : " ") + trailing;
  if (iterationParts.length > 0) {
    name += ` (${iterationParts.join(" ")})`;
  }
  return name;
}

export function prettifyScopeType(
  scopeType: SimpleScopeTypeType | ScopeType,
): string {
  return capitalize(camelCaseToAllDown(serializeScopeType(scopeType)));
}

export function getFacetInfo(
  languageId: string,
  facetId: ScopeSupportFacet | PlaintextScopeSupportFacet,
): ScopeSupportFacetInfo {
  const facetInfo =
    languageId === "plaintext"
      ? plaintextScopeSupportFacetInfos[facetId as PlaintextScopeSupportFacet]
      : scopeSupportFacetInfos[facetId as ScopeSupportFacet];

  if (facetInfo == null) {
    throw Error(`Missing scope support facet info for: ${facetId}`);
  }

  return facetInfo;
}
