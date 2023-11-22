import {
  asyncSafety,
  getScopeTestPaths,
  Position,
  Range,
  ScopeRanges,
  ScopeSupportFacet,
  scopeSupportFacetInfos,
  ScopeSupportFacetLevel,
  ScopeType,
  shouldUpdateFixtures,
  TargetRanges,
  TextualScopeSupportFacet,
  textualScopeSupportFacetInfos,
} from "@cursorless/common";
import { getCursorlessApi, openNewEditor } from "@cursorless/vscode-common";
import { assert } from "chai";
import { groupBy } from "lodash";
import { promises as fsp } from "node:fs";
import { endToEndTestSetup } from "../endToEndTestSetup";

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
  const { getLanguageScopeSupport } = (await getCursorlessApi()).testHelpers!;

  const scopeSupport: Record<string, ScopeSupportFacetLevel | undefined> =
    getLanguageScopeSupport(languageId);

  if (scopeSupport == null) {
    assert.fail(`Missing scope support for language '${languageId}'`);
  }

  const supportedFacets = Object.keys(scopeSupport).filter(
    (facet) => scopeSupport[facet] === ScopeSupportFacetLevel.supported,
  );

  // Assert that all tested facets are supported by the language
  for (const testedFacet of testedFacets) {
    if (!supportedFacets.includes(testedFacet)) {
      assert.fail(`Missing scope support for tested facet '${testedFacet}'`);
    }
  }

  // Assert that all supported facets are tested
  for (const supportedFacet of supportedFacets) {
    if (!testedFacets.includes(supportedFacet)) {
      assert.fail(`Missing test for scope support facet '${supportedFacet}'`);
    }
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

  const codeLines = code.split("\n");

  const outputFixture = [
    ...codeLines,
    "---",
    serializeScopes(codeLines, scopes),
    "",
  ].join("\n");

  if (shouldUpdateFixtures()) {
    await fsp.writeFile(file, outputFixture);
  } else {
    assert.equal(outputFixture, fixture);
  }
}

function serializeScopes(codeLines: string[], scopes: ScopeRanges[]): string {
  return scopes
    .map((scope, index) =>
      serializeScope(
        codeLines,
        scope,
        scopes.length > 1 ? index + 1 : undefined,
      ),
    )
    .join("\n");
}

function serializeScope(
  codeLines: string[],
  scope: ScopeRanges,
  index: number | undefined,
): string {
  return [
    serializeTargets(codeLines, scope.targets, [], index),
    serializeHeader(codeLines, [], "Domain", index, scope.domain),
  ].join("\n");
}

function serializeTargets(
  codeLines: string[],
  targets: TargetRanges[],
  prefix: string[],
  index: number | undefined,
): string {
  return targets
    .map((target) => serializeTarget(codeLines, target, prefix, index))
    .join("\n");
}

function serializeTarget(
  codeLines: string[],
  target: TargetRanges,
  prefix: string[],
  index: number | undefined,
): string {
  const lines: string[] = [];

  lines.push(
    serializeHeader(codeLines, prefix, "Content", index, target.contentRange),
    serializeHeader(codeLines, prefix, "Removal", index, target.removalRange),
  );

  if (target.leadingDelimiter != null) {
    lines.push(
      serializeTarget(
        codeLines,
        target.leadingDelimiter,
        [...prefix, "Leading delimiter"],
        index,
      ),
    );
  }

  if (target.trailingDelimiter != null) {
    lines.push(
      serializeTarget(
        codeLines,
        target.trailingDelimiter,
        [...prefix, "Trailing delimiter"],
        index,
      ),
    );
  }

  if (target.interior != null) {
    lines.push(
      serializeTargets(
        codeLines,
        target.interior,
        [...prefix, "Interior"],
        index,
      ),
    );
  }

  if (target.boundary != null) {
    lines.push(
      serializeTargets(
        codeLines,
        target.boundary,
        [...prefix, "Boundary"],
        index,
      ),
    );
  }

  return lines.join("\n");
}

function serializeHeader(
  codeLines: string[],
  prefix: string[],
  header: string,
  index: number | undefined,
  range: Range,
): string {
  const { start, end } = range;
  const fullHeader = (() => {
    const parts: string[] = [];
    if (index != null) {
      parts.push(`#${index}`);
    }
    if (prefix.length > 0) {
      parts.push(prefix.join(" | ") + ":");
    }
    parts.push(header);
    return parts.join(" ");
  })();
  const lines: string[] = ["", `[${fullHeader}]`];

  codeLines.forEach((codeLine, index) => {
    const fullCodeLine = " " + codeLine;

    if (index === start.line) {
      if (range.isSingleLine) {
        lines.push(fullCodeLine);
        lines.push(serializeRange(start, end));
      } else {
        lines.push(serializeStartRange(start, codeLine.length));
        lines.push(fullCodeLine);
      }
    } else if (index === end.line) {
      lines.push(fullCodeLine);
      lines.push(serializeEndRange(end));
    } else {
      lines.push(fullCodeLine);
    }
  });

  return lines.join("\n");
}

function serializeRange(start: Position, end: Position): string {
  if (start.isEqual(end)) {
    return [new Array(start.character + 1).join(" "), "[]"].join("");
  }
  return [
    new Array(start.character + 2).join(" "),
    new Array(end.character - start.character + 1).join("^"),
  ].join("");
}

function serializeStartRange(start: Position, rowLength: number): string {
  return [
    new Array(start.character + 1).join(" "),
    "[",
    new Array(rowLength - start.character + 1).join("-"),
  ].join("");
}

function serializeEndRange(end: Position): string {
  return [" ", new Array(end.character + 1).join("-"), "]"].join("");
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
