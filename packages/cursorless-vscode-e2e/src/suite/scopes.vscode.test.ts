import {
  asyncSafety,
  getLanguageScopeSupport,
  getScopeTestConfigPaths,
  getScopeTestPaths,
  ScopeSupportFacet,
  scopeSupportFacetInfos,
  ScopeSupportFacetLevel,
  ScopeType,
  shouldUpdateFixtures,
  TextualScopeSupportFacet,
  textualScopeSupportFacetInfos,
  type ScopeTestPath,
} from "@cursorless/common";
import { getCursorlessApi, openNewEditor } from "@cursorless/vscode-common";
import { assert } from "chai";
import { groupBy, uniq, type Dictionary } from "lodash";
import { readFileSync, promises as fsp } from "node:fs";
import { endToEndTestSetup } from "../endToEndTestSetup";
import {
  serializeIterationScopeFixture,
  serializeScopeFixture,
} from "./serializeScopeFixture";

interface Config {
  imports?: string[];
  skip?: boolean;
}

suite("Scope test cases", async function () {
  endToEndTestSetup(this);

  const testPaths = getTestPaths();

  if (!shouldUpdateFixtures()) {
    const languages = groupBy(testPaths, (test) => test.languageId);
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

    const scopeSupport = getLanguageScopeSupport(languageId);

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
  if (languageId === "textual") {
    const { scopeType, isIteration } =
      textualScopeSupportFacetInfos[facetId as TextualScopeSupportFacet];
    return {
      scopeType: { type: scopeType },
      isIteration: isIteration ?? false,
    };
  }

  const { scopeType, isIteration } =
    scopeSupportFacetInfos[facetId as ScopeSupportFacet];
  return {
    scopeType: { type: scopeType },
    isIteration: isIteration ?? false,
  };
}

function getTestPaths(): ScopeTestPath[] {
  const configPaths = getScopeTestConfigPaths();
  const configs = readConfigFiles(configPaths);
  const testPathsRaw = getScopeTestPaths();
  const languagesRaw = groupBy(testPathsRaw, (test) => test.languageId);
  const result: ScopeTestPath[] = [];

  // Languages without any tests still needs to be included in case they have an import
  for (const languageId of Object.keys(configs)) {
    if (!languagesRaw[languageId]) {
      languagesRaw[languageId] = [];
    }
  }

  for (const languageId of Object.keys(languagesRaw)) {
    const config = configs[languageId];

    // This 'language' only exists to be imported by other
    if (config?.skip) {
      continue;
    }

    const testPathsForLanguage: ScopeTestPath[] = [];
    addTestPathsForLanguageRecursively(
      languagesRaw,
      configs,
      testPathsForLanguage,
      new Set(),
      languageId,
    );
    for (const test of testPathsForLanguage) {
      const name =
        languageId === test.languageId
          ? test.name
          : `${test.name.replace(`/${test.languageId}/`, `/${languageId}/`)} (${test.languageId})`;
      result.push({
        ...test,
        languageId,
        name,
      });
    }
  }

  return result;
}

function addTestPathsForLanguageRecursively(
  languages: Dictionary<ScopeTestPath[]>,
  configs: Record<string, Config | undefined>,
  result: ScopeTestPath[],
  usedLanguageIds: Set<string>,
  languageId: string,
): void {
  if (usedLanguageIds.has(languageId)) {
    return;
  }

  if (!languages[languageId]) {
    throw Error(`No test paths found for language ${languageId}`);
  }

  result.push(...languages[languageId]);
  usedLanguageIds.add(languageId);

  const config = configs[languageId];
  const importLanguageIds = config?.imports ?? [];

  for (const langImport of importLanguageIds) {
    addTestPathsForLanguageRecursively(
      languages,
      configs,
      result,
      usedLanguageIds,
      langImport,
    );
  }
}

function readConfigFiles(
  configPaths: { languageId: string; path: string }[],
): Record<string, Config> {
  const result: Record<string, Config> = {};
  for (const p of configPaths) {
    const content = readFileSync(p.path, "utf8");
    result[p.languageId] = JSON.parse(content) as Config;
  }
  return result;
}
