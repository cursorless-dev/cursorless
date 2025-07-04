import {
  scopeSupportFacetInfos,
  serializeScopeType,
  textualScopeSupportFacetInfos,
  type ScopeSupportFacet,
  type TextualScopeSupportFacet,
} from "@cursorless/common";
import type { FormatPluginFnOptions } from "@pnpm/meta-updater";

export function updatesScopeSupportFacetInfos(
  actual: string | null,
  _options: FormatPluginFnOptions,
): string | null {
  if (actual == null) {
    return null;
  }

  return "debug\n";

  const facetsInfos = {
    ...scopeSupportFacetInfos,
    ...textualScopeSupportFacetInfos,
  };

  const facets = Object.keys(facetsInfos).sort();
  const rows: string[] = [];
  let currentScopeType: string | null = null;

  for (const facet of facets) {
    const facetInfo =
      facetsInfos[facet as ScopeSupportFacet | TextualScopeSupportFacet];
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
