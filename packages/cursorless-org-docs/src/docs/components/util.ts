import {
  camelCaseToAllDown,
  capitalize,
  plaintextScopeSupportFacetInfos,
  scopeSupportFacetInfos,
  type PlaintextScopeSupportFacet,
  type ScopeSupportFacet,
  type ScopeSupportFacetInfo,
  type ScopeTypeType,
} from "@cursorless/common";

export function prettifyFacet(
  facet: ScopeSupportFacet | PlaintextScopeSupportFacet,
): string {
  const parts = facet.split(".").map(camelCaseToAllDown);

  if (parts.length === 1) {
    return capitalize(parts[0]);
  }

  const iterationIndex = parts.indexOf("iteration");

  // Capitalize scope
  parts[0] = capitalize(parts[0]);

  // Unless the second part is the iteration scope we want to add `:` to the first part
  // and capitalize the second part.
  if (iterationIndex < 0 || iterationIndex > 1) {
    parts[0] = parts[0] + ":";
    parts[1] = capitalize(parts[1]);
  }

  // If we have an iteration, we want to put it in parentheses at the end
  if (iterationIndex > 0) {
    const iteration = parts.slice(iterationIndex).join(" ");
    parts.length = iterationIndex;
    parts.push(`(${iteration})`);
  }

  return parts.join(" ");
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

export function nameComparator(
  a: { name: string },
  b: { name: string },
): number {
  return a.name.localeCompare(b.name, undefined, { numeric: true });
}

export function isScopeInternal(scope: ScopeTypeType): boolean {
  switch (scope) {
    case "disqualifyDelimiter":
    case "pairDelimiter":
    case "textFragment":
      return true;
    default:
      return false;
  }
}
