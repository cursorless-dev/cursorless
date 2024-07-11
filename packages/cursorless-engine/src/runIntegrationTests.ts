import { languageMatchers } from "./languages/getNodeMatcher";
import { TreeSitter } from "./typings/TreeSitter";
import { legacyLanguageIds } from "./languages/LegacyLanguageId";
import { LanguageDefinitions } from "./languages/LanguageDefinitions";
import assert from "assert";
import { unsafeKeys } from "./util/object";

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
  languageDefinitions: LanguageDefinitions,
) {
  await assertNoScopesBothLegacyAndNew(treeSitter, languageDefinitions);
}

async function assertNoScopesBothLegacyAndNew(
  treeSitter: TreeSitter,
  languageDefinitions: LanguageDefinitions,
) {
  const errors: string[] = [];
  for (const languageId of legacyLanguageIds) {
    await treeSitter.loadLanguage(languageId);
    await languageDefinitions.loadLanguage(languageId);

    unsafeKeys(languageMatchers[languageId] ?? {}).map((scopeTypeType) => {
      if (
        languageDefinitions.get(languageId)?.getScopeHandler({
          type: scopeTypeType,
        }) != null
      ) {
        errors.push(
          `Scope '${scopeTypeType}' defined as both legacy and new for language ${languageId}`,
        );
      }
    });
  }

  assert.deepStrictEqual(errors, []);
}
