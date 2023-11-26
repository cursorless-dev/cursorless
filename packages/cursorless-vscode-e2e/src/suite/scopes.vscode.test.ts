import {
  asyncSafety,
  getLanguageScopeSupport,
  getScopeTestPaths,
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
import { groupBy } from "lodash";
import { promises as fsp } from "node:fs";
import { endToEndTestSetup } from "../endToEndTestSetup";
import { serializeScopes } from "./serializeScopes";

suite("Scope test cases", async function () {
  endToEndTestSetup(this);

  const testPaths = getScopeTestPaths();
  const languages = groupBy(testPaths, (test) => test.languageId);

  if (!shouldUpdateFixtures()) {
    Object.entries(languages).forEach(([languageId, testPaths]) =>
      test(
        languageId,
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

async function testLanguageSupport(languageId: string, testedFacets: string[]) {
  const scopeSupport: Record<string, ScopeSupportFacetLevel | undefined> =
    getLanguageScopeSupport(languageId);

  if (scopeSupport == null) {
    assert.fail(`Missing scope support for language '${languageId}'`);
  }

  const supportedFacets = Object.keys(scopeSupport).filter(
    (facet) => scopeSupport[facet] === ScopeSupportFacetLevel.supported,
  );

  // Assert that all tested facets are supported by the language
  const unsupportedFacets = testedFacets.filter(
    (testedFacet) => !supportedFacets.includes(testedFacet),
  );
  if (unsupportedFacets.length > 0) {
    const values = unsupportedFacets.join(", ");
    assert.fail(`Missing scope support for tested facets [${values}]`);
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
  const scopeType = getScopeType(facetId);
  const fixture = (await fsp.readFile(file, "utf8"))
    .toString()
    .replaceAll("\r\n", "\n");
  const delimiterIndex = fixture.match(/\r?\n^---$/m)?.index;

  assert.ok(
    delimiterIndex != null,
    "Can't find delimiter '---' in scope fixture",
  );

  const code = fixture.slice(0, delimiterIndex);

  await openNewEditor(code, { languageId });

  const editor = ide.activeTextEditor!;

  const scopes = scopeProvider.provideScopeRanges(editor, {
    visibleOnly: false,
    scopeType,
  });

  const outputFixture = serializeScopes(code, scopes);

  if (shouldUpdateFixtures()) {
    await fsp.writeFile(file, outputFixture);
  } else {
    assert.equal(outputFixture, fixture);
  }
}

function getScopeType(facetId: string): ScopeType {
  if (facetId in textualScopeSupportFacetInfos) {
    const { scopeType } =
      textualScopeSupportFacetInfos[facetId as TextualScopeSupportFacet];
    return { type: scopeType };
  }
  if (facetId in scopeSupportFacetInfos) {
    const { scopeType } = scopeSupportFacetInfos[facetId as ScopeSupportFacet];
    return { type: scopeType };
  }
  throw Error(`Unknown facetId '${facetId}'`);
}
