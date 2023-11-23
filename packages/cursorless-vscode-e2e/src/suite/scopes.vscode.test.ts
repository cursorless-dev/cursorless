import {
  asyncSafety,
  getLanguageScopeSupport,
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
  scopeIndex: number | undefined,
): string {
  if (
    scope.targets.length === 1 &&
    scope.targets[0].contentRange.isRangeEqual(scope.domain)
  ) {
    return serializeTarget(
      codeLines,
      scope.targets[0],
      [],
      scopeIndex,
      undefined,
      scope.domain,
    );
  }

  // If we have multiple targets or the domain is not equal to the content range: add domain last
  return [
    serializeTargets(codeLines, scope.targets, [], scopeIndex),
    "",
    serializeHeader([], "Domain", scopeIndex, undefined),
    serializeCodeRange(codeLines, scope.domain),
  ].join("\n");
}

function serializeTargets(
  codeLines: string[],
  targets: TargetRanges[],
  prefix: string[],
  scopeIndex: number | undefined,
): string {
  return targets
    .map((target, index) =>
      serializeTarget(
        codeLines,
        target,
        prefix,
        scopeIndex,
        targets.length > 1 ? index + 1 : undefined,
      ),
    )
    .join("\n");
}

function serializeTarget(
  codeLines: string[],
  target: TargetRanges,
  prefix: string[],
  scopeIndex: number | undefined,
  targetIndex: number | undefined,
  domain?: Range,
): string {
  const lines: string[] = [];

  lines.push("", serializeHeader(prefix, "Content", scopeIndex, targetIndex));

  // Add removal and domain headers below content header if their ranges are equal
  if (target.contentRange.isRangeEqual(target.removalRange)) {
    lines.push(serializeHeader(prefix, "Removal", scopeIndex, targetIndex));
  }
  if (domain != null && target.contentRange.isRangeEqual(domain)) {
    lines.push(serializeHeader(prefix, "Domain", scopeIndex, targetIndex));
  }

  lines.push(serializeCodeRange(codeLines, target.contentRange));

  // Add separate removal header below content if their ranges are not equal
  if (!target.contentRange.isRangeEqual(target.removalRange)) {
    lines.push(
      "",
      serializeHeader(prefix, "Removal", scopeIndex, targetIndex),
      serializeCodeRange(codeLines, target.removalRange),
    );
  }

  if (target.leadingDelimiter != null) {
    lines.push(
      serializeTarget(
        codeLines,
        target.leadingDelimiter,
        [...prefix, "Leading delimiter"],
        scopeIndex,
        undefined,
      ),
    );
  }

  if (target.trailingDelimiter != null) {
    lines.push(
      serializeTarget(
        codeLines,
        target.trailingDelimiter,
        [...prefix, "Trailing delimiter"],
        scopeIndex,
        undefined,
      ),
    );
  }

  if (target.interior != null) {
    lines.push(
      serializeTargets(
        codeLines,
        target.interior,
        [...prefix, "Interior"],
        scopeIndex,
      ),
    );
  }

  if (target.boundary != null) {
    lines.push(
      serializeTargets(
        codeLines,
        target.boundary,
        [...prefix, "Boundary"],
        scopeIndex,
      ),
    );
  }

  return lines.join("\n");
}

function serializeHeader(
  prefix: string[],
  header: string,
  scopeIndex: number | undefined,
  targetIndex: number | undefined,
): string {
  const parts: string[] = [];
  if (scopeIndex != null) {
    parts.push(`#${scopeIndex}`);
  }
  if (prefix.length > 0) {
    parts.push(prefix.join(" | ") + ":");
  }
  parts.push(header);
  if (targetIndex != null) {
    parts.push(targetIndex.toString());
  }
  return `[${parts.join(" ")}]`;
}

function serializeCodeRange(codeLines: string[], range: Range): string {
  const { start, end } = range;
  const lines: string[] = [];

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
