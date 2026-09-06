import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import type {
  IDE,
  LanguageId,
  LanguageScopeSupportId,
  ScopeSupportFacet,
} from "@cursorless/lib-common";
import {
  ScopeSupportFacetLevel,
  getScopeSupportLanguageId,
  groupBy,
  languageScopeSupport,
  scopeSupportFacetInfos,
  showInfo,
} from "@cursorless/lib-common";
import {
  getScopeTestPathsRecursively,
  getScopeTestsDirPath,
} from "@cursorless/lib-node-common";

export class ScopeTestRecorder {
  constructor(private ide: IDE) {
    this.showUnimplementedFacets = this.showUnimplementedFacets.bind(this);
    this.saveActiveDocument = this.saveActiveDocument.bind(this);
  }

  async showUnimplementedFacets() {
    const languageSelection = await this.languageSelection();

    if (languageSelection == null) {
      return;
    }

    const languageId = getScopeSupportLanguageId(languageSelection);
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
    const header = `[[${languageSelection}]]\n\n`;
    const snippetText = `${header}${missingScopeFacetRows.join("\n")}`;

    const editor = await this.ide.openUntitledTextDocument({
      language: "markdown",
    });

    const editableEditor = this.ide.getEditableTextEditor(editor);
    await editableEditor.insertSnippet(snippetText);
  }

  async saveActiveDocument() {
    const text = this.ide.activeTextEditor?.document.getText() ?? "";
    const matchLanguageId = text.match(/^\[\[([\w-]+)\]\]\n/u);

    if (matchLanguageId == null) {
      throw new Error(`Can't match language id`);
    }

    const languageId = matchLanguageId[1];
    const restText = text.slice(matchLanguageId[0].length);

    const parts = restText
      .split(/^---$/gmu)
      .map((p) => p.trimStart())
      .filter(Boolean);

    const facetsToAdd: { facet: string; content: string }[] = [];

    for (const part of parts) {
      const match = part.match(/^\[([\w.]+)\].*\n([\s\S]*)$/u);
      const facet = match?.[1];
      const content = match?.[2] ?? "";

      if (facet == null) {
        throw new Error(`Invalid pattern '${part}'`);
      }

      if (!content.trim()) {
        continue;
      }

      facetsToAdd.push({ facet, content });
    }

    const langDirectory = path.join(getScopeTestsDirPath(), languageId);

    await fsPromises.mkdir(langDirectory, { recursive: true });

    for (const { facet, content } of facetsToAdd) {
      const fileName = `${facet}.scope`;
      const fullContent = `${content}---\n`;
      const subDirectory = path.join(langDirectory, facet.split(".")[0]);
      const directory = fs.existsSync(subDirectory)
        ? subDirectory
        : langDirectory;
      let filePath = path.join(directory, fileName);
      let i = 2;

      while (fs.existsSync(filePath)) {
        filePath = path.join(directory, `${facet}${i++}.scope`);
      }

      await fsPromises.writeFile(filePath, fullContent, "utf8");
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
      defaultValue: this.ide.activeTextEditor?.document.languageId,
    });
  }
}

function getSupportedScopeFacets(
  languageId: LanguageScopeSupportId,
): ScopeSupportFacet[] {
  const scopeSupport = languageScopeSupport[languageId];

  if (scopeSupport == null) {
    throw new Error(`Missing scope support for language '${languageId}'`);
  }

  const scopeFacets = Object.keys(scopeSupport) as ScopeSupportFacet[];

  return scopeFacets.filter(
    (facet) => scopeSupport[facet] === ScopeSupportFacetLevel.supported,
  );
}

function getExistingScopeFacetTest(languageId: LanguageId): Set<string> {
  const testPaths = getScopeTestPathsRecursively();
  const languages = groupBy(testPaths, (test) => test.languageId);
  const testPathsForLanguage = languages.get(languageId) ?? [];
  const facets = testPathsForLanguage.map((test) => test.facet);
  return new Set(facets);
}
