import * as assert from "node:assert/strict";
import { promises as fsp } from "node:fs";
import { groupBy, uniq } from "lodash-es";
import type {
  PlaintextScopeSupportFacet,
  ScopeRangeConfig,
  ScopeSupportFacet,
  ScopeType,
} from "@cursorless/lib-common";
import {
  asyncSafety,
  languageScopeSupport,
  plaintextScopeSupportFacetInfos,
  scopeSupportFacetInfos,
  ScopeSupportFacetLevel,
  shouldUpdateFixtures,
} from "@cursorless/lib-common";
import { getScopeTestPathsRecursively } from "@cursorless/lib-node-common";
import type { TestEnvironment } from "../testUtil/createTestEnvironment";
import { createTestEnvironment } from "../testUtil/createTestEnvironment";
import {
  serializeIterationScopeFixture,
  serializeScopeFixture,
} from "../testUtil/serializeScopeFixture";

suite("Scope test cases", () => {
  const testPaths = getScopeTestPathsRecursively();
  let testEnvironment: TestEnvironment;

  suiteSetup(
    asyncSafety(async () => {
      testEnvironment = await createTestEnvironment();
    }),
  );

  if (!shouldUpdateFixtures()) {
    const languages = groupBy(testPaths, (test) => test.languageId);

    // This handles the case where a language has no tests, but is still listed
    // in the config. In that case, just using the language ids from the tests
    // would miss the language entirely even though it appears in the config.
    for (const language of Object.keys(languageScopeSupport)) {
      languages[language] ??= [];
    }

    for (const languageId of Object.keys(languages).toSorted()) {
      const tests = languages[languageId];
      test(`${languageId} facet coverage`, () =>
        testLanguageSupport(
          languageId,
          tests.map((test) => test.facet),
        ));
    }
  }

  for (const { path, name, languageId, facet } of testPaths) {
    test(
      name,
      asyncSafety(() => runTest(testEnvironment, path, languageId, facet)),
    );
  }
});

/**
 * Ensures that all supported facets for a language are tested, and that all
 * tested facets are listed as supported in {@link getLanguageScopeSupport}
 * @param languageId The language to test
 * @param testedFacets The facets for {@link languageId} that are tested
 */
function testLanguageSupport(languageId: string, testedFacets: string[]) {
  const supportedFacets = (() => {
    if (languageId === "plaintext") {
      return Object.keys(plaintextScopeSupportFacetInfos);
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
    const values = uniq(unsupportedFacets).toSorted().join(", ");
    assert.fail(
      `Facets [${values}] are tested but not listed in getLanguageScopeSupport`,
    );
  }

  // Assert that all supported facets are tested
  const untestedFacets = supportedFacets.filter(
    (supportedFacet) => !testedFacets.includes(supportedFacet),
  );
  if (untestedFacets.length > 0) {
    const values = untestedFacets.toSorted().join(", ");
    assert.fail(`Missing test for scope support facets [${values}]`);
  }
}

async function runTest(
  testEnvironment: TestEnvironment,
  file: string,
  languageId: string,
  facetId: string,
) {
  const { scopeType, isIteration } = getFacetInfo(languageId, facetId);
  const content = await fsp.readFile(file, "utf8");
  const fixture = content.toString().replaceAll("\r\n", "\n");
  const delimiterIndex = fixture.match(/^---$/mu)?.index;

  assert.ok(
    delimiterIndex != null,
    "Can't find delimiter '---' in scope fixture",
  );

  const code = fixture.slice(0, delimiterIndex - 1);

  const editor = await testEnvironment.openNewEditor(code, languageId);

  const updateFixture = shouldUpdateFixtures();

  const [outputFixture, numScopes] = ((): [string, number] => {
    const config: ScopeRangeConfig = {
      visibleOnly: false,
      scopeType,
    };

    if (isIteration) {
      const iterationScopes =
        testEnvironment.scopeProvider.provideIterationScopeRanges(editor, {
          ...config,
          includeNestedTargets: false,
        });

      if (!updateFixture) {
        assert.ok(
          !iterationScopes.some((s) =>
            s.ranges.some((r) => !s.domain.contains(r.range)),
          ),
          "Iteration range should not contain the domain",
        );
      }

      return [
        serializeIterationScopeFixture(code, iterationScopes),
        iterationScopes.length,
      ];
    }

    const scopes = testEnvironment.scopeProvider.provideScopeRanges(
      editor,
      config,
    );

    if (!updateFixture) {
      assert.ok(
        !scopes.some((s) =>
          s.targets.some((t) => !s.domain.contains(t.contentRange)),
        ),
        "Content range should not contain the domain",
      );
      assert.ok(
        !scopes.some((s) =>
          s.targets.some((t) => !s.domain.contains(t.contentRange)),
        ),
        "Content range should not contain the removal range",
      );
    }

    return [serializeScopeFixture(facetId, code, scopes), scopes.length];
  })();

  if (updateFixture) {
    await fsp.writeFile(file, outputFixture);
  } else {
    assert.ok(numScopes > 0, "No scopes found");
    assert.equal(outputFixture, fixture);
  }
}

function getFacetInfo(
  languageId: string,
  facetId: string,
): {
  scopeType: ScopeType;
  isIteration: boolean;
} {
  const facetInfo =
    languageId === "plaintext"
      ? plaintextScopeSupportFacetInfos[facetId as PlaintextScopeSupportFacet]
      : scopeSupportFacetInfos[facetId as ScopeSupportFacet];

  if (facetInfo == null) {
    throw new Error(`Missing scope support facet info for: ${facetId}`);
  }

  const { scopeType, isIteration } = facetInfo;
  const fullScopeType =
    typeof scopeType === "string" ? { type: scopeType } : scopeType;

  return {
    scopeType: fullScopeType,
    isIteration: isIteration ?? false,
  };
}
