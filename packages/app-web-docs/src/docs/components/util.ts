import type {
  PlaintextScopeSupportFacet,
  ScopeSupportFacet,
  ScopeSupportFacetInfo,
} from "@cursorless/lib-common";
import {
  plaintextScopeSupportFacetInfos,
  scopeSupportFacetInfos,
} from "@cursorless/lib-common";

export function getFacetInfo(
  languageId: string,
  facetId: ScopeSupportFacet | PlaintextScopeSupportFacet,
): ScopeSupportFacetInfo {
  const facetInfo =
    languageId === "plaintext"
      ? plaintextScopeSupportFacetInfos[facetId as PlaintextScopeSupportFacet]
      : scopeSupportFacetInfos[facetId as ScopeSupportFacet];

  if (facetInfo == null) {
    throw new Error(`Missing scope support facet info for: ${facetId}`);
  }

  return facetInfo;
}
