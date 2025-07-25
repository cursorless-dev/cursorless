import {
  scopeSupportFacetInfos,
  serializeScopeType,
  plaintextScopeSupportFacetInfos,
  type ScopeSupportFacet,
  type PlaintextScopeSupportFacet,
} from "@cursorless/common";
import type { FormatPluginFnOptions } from "@pnpm/meta-updater";

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

  const facets = Object.keys(facetsInfos).sort();
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
