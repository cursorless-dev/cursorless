import {
  asyncSafety,
  getScopeTestPaths,
  Position,
  Range,
  ScopeRanges,
  ScopeType,
  shouldUpdateFixtures,
  TargetRanges,
} from "@cursorless/common";
import { getCursorlessApi, openNewEditor } from "@cursorless/vscode-common";
import { assert } from "chai";
import { promises as fsp } from "node:fs";
import { endToEndTestSetup } from "../endToEndTestSetup";

suite("Scope test cases", async function () {
  endToEndTestSetup(this);

  getScopeTestPaths().forEach(({ path, name, languageId, facetId }) =>
    test(
      name,
      asyncSafety(() => runTest(path, languageId, facetId)),
    ),
  );
});

async function runTest(file: string, languageId: string, facetId: string) {
  const { ide, scopeProvider } = (await getCursorlessApi()).testHelpers!;
  const scopeType = getScope(facetId);
  const fixture = (await fsp.readFile(file)).toString();
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

  const outputFixture = [code, "---", serializeScopes(code, scopes), ""].join(
    "\n",
  );

  if (shouldUpdateFixtures()) {
    await fsp.writeFile(file, outputFixture);
  } else {
    assert.equal(outputFixture, fixture);
  }
}

function serializeScopes(code: string, scopes: ScopeRanges[]): string {
  const codeLines = code.split(/\r?\n/);
  return scopes.map((scope) => serializeScope(codeLines, scope)).join("\n");
}

function serializeScope(codeLines: string[], scope: ScopeRanges): string {
  return [
    serializeTargets(codeLines, scope.targets, []),
    serializeHeader(codeLines, [], "Domain", scope.domain),
  ].join("\n");
}

function serializeTargets(
  codeLines: string[],
  targets: TargetRanges[],
  prefix: string[],
): string {
  return targets
    .map((target) => serializeTarget(codeLines, target, prefix))
    .join("\n");
}

function serializeTarget(
  codeLines: string[],
  target: TargetRanges,
  prefix: string[],
): string {
  const lines: string[] = [];

  lines.push(
    serializeHeader(codeLines, prefix, "Content", target.contentRange),
    serializeHeader(codeLines, prefix, "Removal", target.removalRange),
  );

  if (target.leadingDelimiter != null) {
    lines.push(
      serializeTarget(codeLines, target.leadingDelimiter, [
        ...prefix,
        "Leading delimiter",
      ]),
    );
  }

  if (target.trailingDelimiter != null) {
    lines.push(
      serializeTarget(codeLines, target.trailingDelimiter, [
        ...prefix,
        "Trailing delimiter",
      ]),
    );
  }

  if (target.interior != null) {
    lines.push(
      serializeTargets(codeLines, target.interior, [...prefix, "Interior"]),
    );
  }

  if (target.boundary != null) {
    lines.push(
      serializeTargets(codeLines, target.boundary, [...prefix, "Boundary"]),
    );
  }

  return lines.join("\n");
}

function serializeHeader(
  codeLines: string[],
  prefix: string[],
  header: string,
  range: Range,
): string {
  const { start, end } = range;
  const fullHeader =
    prefix.length > 0 ? `${prefix.join(" | ")}: ${header}` : header;
  const lines: string[] = ["", `[${fullHeader}]`];

  codeLines.forEach((codeLine, index) => {
    lines.push(codeLine);
    if (index === start.line) {
      lines.push(renderStartRange(start, end, codeLine.length));
    } else if (index === end.line) {
      lines.push(renderEndRange(end));
    }
  });

  return lines.join("\n");
}

const SYMBOL = "^";

function renderStartRange(
  start: Position,
  end: Position,
  rowLength: number,
): string {
  const chars: string[] = [];
  const length = start.line === end.line ? end.character : rowLength;
  for (let i = 0; i < length; ++i) {
    chars.push(i < start.character ? " " : SYMBOL);
  }
  return chars.join("");
}

function renderEndRange(end: Position): string {
  return new Array(end.character).join(SYMBOL);
}

function getScope(facetId: string): ScopeType {
  if (facetId.endsWith(".name")) {
    return { type: "name" };
  }
  if (facetId.endsWith(".value")) {
    return { type: "value" };
  }
  throw Error(`Unknown facetId ${facetId}`);
}
