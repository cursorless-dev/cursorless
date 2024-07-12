import {
  ScopeSupportFacetLevel,
  getScopeTestPathsRecursively,
  getScopeTestsDirPath,
  groupBy,
  languageScopeSupport,
  scopeSupportFacetInfos,
  showInfo,
  type IDE,
  type ScopeSupportFacet,
} from "@cursorless/common";
import * as fs from "node:fs";
import * as fsPromises from "node:fs/promises";
import * as path from "pathe";

export class ScopeTestRecorder {
  constructor(private ide: IDE) {
    this.showUnimplementedFacets = this.showUnimplementedFacets.bind(this);
    this.saveActiveDocument = this.saveActiveDocument.bind(this);
  }

  async showUnimplementedFacets() {
    const languageId = await this.languageSelection();

    if (languageId == null) {
      return;
    }

    const supportedScopeFacets = getSupportedScopeFacets(languageId);
    const existingScopeTestFacets = getExistingScopeFacetTest(languageId);

    const missingScopeFacets = supportedScopeFacets.filter(
      (facet) => !existingScopeTestFacets.has(facet),
    );

    let currentSnippetPlaceholder = 1;
    const missingScopeFacetRows = missingScopeFacets.map(
      (facet) =>
        `[${facet}] - ${scopeSupportFacetInfos[facet].description}\n$${currentSnippetPlaceholder++}\n---\n`,
    );
    const header = `[[${languageId}]]\n\n`;
    const snippetText = `${header}${missingScopeFacetRows.join("\n")}`;

    const editor = await this.ide.openUntitledTextDocument({
      language: "markdown",
    });

    const editableEditor = this.ide.getEditableTextEditor(editor);
    await editableEditor.insertSnippet(snippetText);
  }

  async saveActiveDocument() {
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
      const match = part.match(/^\[([\w.]+)\].*\n([\s\S]*)$/);
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

    const langDirectory = path.join(getScopeTestsDirPath(), languageId);

    await fsPromises.mkdir(langDirectory, { recursive: true });

    for (const { facet, content } of facetsToAdd) {
      const fullContent = `${content}---\n`;
      let filePath = path.join(langDirectory, `${facet}.scope`);
      let i = 2;

      while (fs.existsSync(filePath)) {
        filePath = path.join(langDirectory, `${facet}${i++}.scope`);
      }

      await fsPromises.writeFile(filePath, fullContent, "utf-8");
    }

    await showInfo(
      this.ide.messages,
      "scopeTestsSaved",
      `${facetsToAdd.length} scope tests saved for language '${languageId}`,
    );
  }

  private languageSelection() {
    const languageIds = Object.keys(languageScopeSupport);
    languageIds.sort();
    return this.ide.showQuickPick(languageIds, {
      title: "Select language to record scope tests for",
    });
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
