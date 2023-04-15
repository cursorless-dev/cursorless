import assert = require("assert");
import { LanguageDefinitionsImpl } from "./languages/LanguageDefinitionsImpl";
import { supportedLanguageIds } from "./languages/constants";
import { languageMatchers } from "./languages/getNodeMatcher";
import { TreeSitter } from "./typings/TreeSitter";

/**
 * Run tests that require multiple components to be instantiated, as well as a
 * full context, eg including tree sitter, but that are too closely tied to the
 * engine to be defined in cursorless-vscode-e2e
 *
 * @param treeSitter The tree sitter instance
 * @param languageDefinitions The language definitions instance
 */
export async function runIntegrationTests(
  treeSitter: TreeSitter,
  languageDefinitions: LanguageDefinitionsImpl,
) {
  await assertNoScopesBothLegacyAndNew(treeSitter, languageDefinitions);
}

async function assertNoScopesBothLegacyAndNew(
  treeSitter: TreeSitter,
  languageDefinitions: LanguageDefinitionsImpl,
) {
  for (const languageId of supportedLanguageIds) {
    await treeSitter.loadLanguage(languageId);

    Object.keys(languageMatchers[languageId]).map((scopeTypeType) => {
      assert(
        languageDefinitions.get(languageId)?.maybeGetLanguageScopeHandler({
          type: scopeTypeType,
        }) == null,
        `Scope '${scopeTypeType}' defined as both legacy and new for language ${languageId}`,
      );
    });
  }
}
