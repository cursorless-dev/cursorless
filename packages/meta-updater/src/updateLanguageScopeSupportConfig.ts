import {
  ScopeSupportFacetLevel,
  languageScopeSupport,
  scopeSupportFacets,
  type LanguageScopeSupportFacetMap,
  type ScopeSupportFacet,
} from "@cursorless/common";
import type { FormatPluginFnOptions } from "@pnpm/meta-updater";
import { Context } from "./Context";

/**
 * Given a tsconfig.json, update it to match our conventions.  This function is
 * called by the pnpm `meta-updater` plugin either to check if the tsconfig.json
 * is up to date or to update it, depending on flags.
 * @param context Contains context such as workspace dir and parsed pnpm
 * lockfile
 * @param actual The input tsconfig.json that should be checked / updated
 * @param options Extra information provided by pnpm; mostly just the directory
 * of the package whose tsconfig.json we are updating
 * @returns The updated tsconfig.json
 */
export function updateLanguageScopeSupportConfig(
  { workspaceDir }: Context,
  actual: string | null,
  options: FormatPluginFnOptions,
): string | null {
  /** Directory of the package whose package.json we are updating */
  const packageDir = options.dir;

  /** Whether we are updating the top-level package.json */
  const isRoot = packageDir === workspaceDir;

  if (!isRoot || actual == null) {
    return null;
  }

  const header = "## Scope support per language";

  const indexHeader = actual.indexOf(header);

  if (indexHeader === -1) {
    throw new Error(
      `Expected to find header "${header}" in language-scope-support.md`,
    );
  }

  const pre = actual.substring(0, indexHeader + header.length) + "\n\n";

  const languageContents = Object.entries(languageScopeSupport).map(
    ([languageId, scopeSupport]) =>
      getContentForLanguage(
        scopeSupport as LanguageScopeSupportFacetMap,
        languageId,
      ),
  );

  return pre + languageContents.join("\n\n") + "\n";
}

function getContentForLanguage(
  scopeSupport: LanguageScopeSupportFacetMap,
  languageId: string,
) {
  const lines = [`### ${languageId}`];
  const scopesSorted = [...scopeSupportFacets].sort();

  const supportedScopes = scopesSorted.filter(
    (facet) => scopeSupport[facet] === ScopeSupportFacetLevel.supported,
  );
  const supportedLegacyScopes = scopesSorted.filter(
    (facet) => scopeSupport[facet] === ScopeSupportFacetLevel.supportedLegacy,
  );
  const unsupportedScopes = scopesSorted.filter(
    (facet) =>
      scopeSupport[facet] === ScopeSupportFacetLevel.unsupported ||
      scopeSupport[facet] == null,
  );
  lines.push(
    getContentForSupportLevel(
      supportedScopes,
      "Supported facets",
      "These facets are supported",
    ),
  );
  if (supportedLegacyScopes.length > 0) {
    lines.push(
      getContentForSupportLevel(
        supportedLegacyScopes,
        "Supported Legacy facets",
        "These facets are supported with the legacy implementation and should be migrated to the new implementation",
      ),
    );
  }
  lines.push(
    getContentForSupportLevel(
      unsupportedScopes,
      "Unsupported facets",
      "These facets are not supported yet a needs a developer to implement them",
    ),
  );

  return lines.join("\n\n");
}

function getContentForSupportLevel(
  facets: ScopeSupportFacet[],
  title: string,
  description: string,
): string {
  return [
    `#### ${title}`,
    "",
    description,
    "",
    ...facets.map((facet) => `- ${facet}`),
  ].join("\n");
}
