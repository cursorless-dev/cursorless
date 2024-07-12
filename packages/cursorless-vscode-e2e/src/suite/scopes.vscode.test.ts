import {
  asyncSafety,
  getScopeTestPathsRecursively,
  languageScopeSupport,
  ScopeSupportFacet,
  scopeSupportFacetInfos,
  ScopeSupportFacetLevel,
  ScopeType,
  shouldUpdateFixtures,
  TextualScopeSupportFacet,
  textualScopeSupportFacetInfos,
} from "@cursorless/common";
import { getCursorlessApi, openNewEditor } from "@cursorless/vscode-common";
import { assert } from "chai";
import { groupBy, uniq } from "lodash-es";
import { promises as fsp } from "node:fs";
import { endToEndTestSetup } from "../endToEndTestSetup";
import {
  serializeIterationScopeFixture,
  serializeScopeFixture,
} from "./serializeScopeFixture";

suite("Scope test cases", async function () {
  endToEndTestSetup(this);

  const testPaths = getScopeTestPathsRecursively();

  if (!shouldUpdateFixtures()) {
    const languages = groupBy(testPaths, (test) => test.languageId);

    // This handles the case where a language has no tests, but is still listed
    // in the config. In that case, just using the language ids from the tests
    // would miss the language entirely even though it appears in the config.
    for (const language of Object.keys(languageScopeSupport)) {
      languages[language] ??= [];
    }

    Object.entries(languages).forEach(([languageId, testPaths]) =>
      test(
        `${languageId} facet coverage`,
        asyncSafety(() =>
          testLanguageSupport(
            languageId,
            testPaths.map((test) => test.facet),
          ),
        ),
      ),
    );
  }

  testPaths.forEach(({ path, name, languageId, facet }) =>
    test(
      name,
      asyncSafety(() => runTest(path, languageId, facet)),
    ),
  );
});

/**
 * Ensures that all supported facets for a language are tested, and that all
 * tested facets are listed as supported in {@link getLanguageScopeSupport}
 * @param languageId The language to test
 * @param testedFacets The facets for {@link languageId} that are tested
 */
async function testLanguageSupport(languageId: string, testedFacets: string[]) {
  const supportedFacets = (() => {
    if (languageId === "textual") {
      return Object.keys(textualScopeSupportFacetInfos);
    }

    const scopeSupport = languageScopeSupport[languageId];

    if (scopeSupport == null) {
      return [];
    }

    return Object.keys(scopeSupport).filter(
      (facet) =>
        scopeSupport[facet as ScopeSupportFacet] ===
        ScopeSupportFacetLevel.supported,
    );
  })();

  // Assert that all tested facets are supported by the language
  const unsupportedFacets = testedFacets.filter(
    (testedFacet) => !supportedFacets.includes(testedFacet),
  );
  if (unsupportedFacets.length > 0) {
    const values = uniq(unsupportedFacets).join(", ");
    assert.fail(
      `Facets [${values}] are tested but not listed in getLanguageScopeSupport`,
    );
  }

  // Assert that all supported facets are tested
  const untestedFacets = supportedFacets.filter(
    (supportedFacet) => !testedFacets.includes(supportedFacet),
  );
  if (untestedFacets.length > 0) {
    const values = untestedFacets.join(", ");
    assert.fail(`Missing test for scope support facets [${values}]`);
  }
}

async function runTest(file: string, languageId: string, facetId: string) {
  const { ide, scopeProvider } = (await getCursorlessApi()).testHelpers!;
  const { scopeType, isIteration } = getScopeType(languageId, facetId);
  const fixture = (await fsp.readFile(file, "utf8"))
    .toString()
    .replaceAll("\r\n", "\n");
  const delimiterIndex = fixture.match(/^---$/m)?.index;

  assert.isDefined(
    delimiterIndex,
    "Can't find delimiter '---' in scope fixture",
  );

  const code = fixture.slice(0, delimiterIndex! - 1);

  await openNewEditor(code, { languageId });

  const editor = ide.activeTextEditor!;

  const outputFixture = ((): string => {
    const config = {
      visibleOnly: false,
      scopeType,
    };

    if (isIteration) {
      const iterationScopes = scopeProvider.provideIterationScopeRanges(
        editor,
        {
          ...config,
          includeNestedTargets: false,
        },
      );
      return serializeIterationScopeFixture(code, iterationScopes);
    }

    const scopes = scopeProvider.provideScopeRanges(editor, config);

    return serializeScopeFixture(code, scopes);
  })();

  if (shouldUpdateFixtures()) {
    await fsp.writeFile(file, outputFixture);
  } else {
    assert.equal(outputFixture, fixture);
  }
}

function getScopeType(
  languageId: string,
  facetId: string,
): {
  scopeType: ScopeType;
  isIteration: boolean;
} {
  const facetInfo =
    languageId === "textual"
      ? textualScopeSupportFacetInfos[facetId as TextualScopeSupportFacet]
      : scopeSupportFacetInfos[facetId as ScopeSupportFacet];

  if (facetInfo == null) {
    throw Error(`Unknown facet '${facetId}'`);
  }

  return {
    scopeType: { type: facetInfo.scopeType },
    isIteration: facetInfo.isIteration ?? false,
  };
}
