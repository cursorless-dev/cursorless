import {
  ScopeSupportFacetLevel,
  getScopeTestPathsRecursively,
  groupBy,
  languageScopeSupport,
  type IDE,
  type ScopeSupportFacet,
} from "@cursorless/common";

export class ScopeTestRecorder {
  constructor(private ide: IDE) {
    this.record = this.record.bind(this);
  }

  record() {
    const languageId = this.ide.activeTextEditor?.document.languageId;

    if (languageId == null) {
      throw Error(`Missing language id from active text editor`);
    }

    const supportedScopeFacets = getSupportedScopeFacets(languageId);
    const existingScopeTestFacets = getExistingScopeFacetTest(languageId);

    const missingScopeFacets = supportedScopeFacets.filter(
      (facet) => !existingScopeTestFacets.has(facet),
    );

    const missingScopeFacetRows = missingScopeFacets.map(
      (facet) => `[${facet}]\n\n---\n`,
    );
    const documentContent = missingScopeFacetRows.join("\n");

    this.ide.openUntitledTextDocument({ content: documentContent });
  }
}

function getSupportedScopeFacets(languageId: string): ScopeSupportFacet[] {
  const scopeSupport = languageScopeSupport[languageId];

  if (scopeSupport == null) {
    throw Error(`Missing scope support for language '${languageId}'`);
  }

  const scopeFacets = Object.keys(scopeSupport) as ScopeSupportFacet[];

  return scopeFacets.filter(
    (facet) => scopeSupport[facet] === ScopeSupportFacetLevel.supported,
  );
}

function getExistingScopeFacetTest(languageId: string): Set<ScopeSupportFacet> {
  const testPaths = getScopeTestPathsRecursively();
  const languages = groupBy(testPaths, (test) => test.languageId);
  const testPathsForLanguage = languages.get(languageId) ?? [];
  const facets = testPathsForLanguage.map((test) => test.facet);
  return new Set(facets);
}
