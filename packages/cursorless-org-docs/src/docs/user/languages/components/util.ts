import {
  camelCaseToAllDown,
  capitalize,
  scopeSupportFacetInfos,
  plaintextScopeSupportFacetInfos,
  type ScopeSupportFacet,
  type ScopeSupportFacetInfo,
  type PlaintextScopeSupportFacet,
} from "@cursorless/common";

export function prettifyFacet(
  facet: ScopeSupportFacet | PlaintextScopeSupportFacet,
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

export function prettifyScopeType(scopeType: string): string {
  return capitalize(camelCaseToAllDown(scopeType));
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
