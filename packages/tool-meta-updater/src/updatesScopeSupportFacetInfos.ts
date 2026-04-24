import type { FormatPluginFnOptions } from "@pnpm/meta-updater";
import type {
  ScopeSupportFacet,
  PlaintextScopeSupportFacet,
} from "@cursorless/lib-common";
import {
  scopeSupportFacetInfos,
  serializeScopeType,
  plaintextScopeSupportFacetInfos,
} from "@cursorless/lib-common";

export function updatesScopeSupportFacetInfos(
  actual: string | null,
  _options: FormatPluginFnOptions,
): string | null {
  if (actual == null) {
    return null;
  }

  const facetsInfos = {
    ...scopeSupportFacetInfos,
    ...plaintextScopeSupportFacetInfos,
  };

  const facets = Object.keys(facetsInfos).toSorted();
  const rows: string[] = [];
  let currentScopeType: string | null = null;

  for (const facet of facets) {
    const facetInfo =
      facetsInfos[facet as ScopeSupportFacet | PlaintextScopeSupportFacet];
    const scopeType = serializeScopeType(facetInfo.scopeType);
    if (scopeType !== currentScopeType) {
      if (currentScopeType != null) {
        rows.push("");
      }
      currentScopeType = scopeType;
      rows.push(`### ${currentScopeType}`);
      rows.push("");
    }
    rows.push(`- \`${facet}\` ${facetInfo.description}`);
  }

  rows.push("");

  return rows.join("\n");
}
