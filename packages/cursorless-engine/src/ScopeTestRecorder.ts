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
    this.start = this.start.bind(this);
    this.finalize = this.finalize.bind(this);
  }

  async start() {
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
    const header = `[[${languageId}]]\n\n`;
    const documentContent = `${header}${missingScopeFacetRows.join("\n")}`;

    await this.ide.openUntitledTextDocument({
      content: documentContent,
    });
  }

  finalize() {
    const text = this.ide.activeTextEditor?.document.getText() ?? "";
    const matchLanguageId = text.match(/^\[\[(\w+)\]\]\n/);

    if (matchLanguageId == null) {
      throw Error(`Can't match language id`);
    }

    const languageId = matchLanguageId[1];
    const restText = text.slice(matchLanguageId[0].length);

    const parts = restText
      .split(/^---$/gm)
      .map((p) => p.trimStart())
      .filter(Boolean);

    const facetsToAdd: { facet: string; content: string }[] = [];

    for (const part of parts) {
      const match = part.match(/^\[(\w+)\]\n(.*)$/s);
      const facet = match?.[1];
      const content = match?.[2] ?? "";

      if (facet == null) {
        throw Error(`Invalid pattern '${part}'`);
      }

      if (!content.trim()) {
        continue;
      }

      facetsToAdd.push({ facet, content });
    }

    console.log(facetsToAdd);
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

function getExistingScopeFacetTest(languageId: string): Set<string> {
  const testPaths = getScopeTestPathsRecursively();
  const languages = groupBy(testPaths, (test) => test.languageId);
  const testPathsForLanguage = languages.get(languageId) ?? [];
  const facets = testPathsForLanguage.map((test) => test.facet);
  return new Set(facets);
}
