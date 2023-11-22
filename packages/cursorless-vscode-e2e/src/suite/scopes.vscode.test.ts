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
  const fixture = (await fsp.readFile(file, "utf8")).toString();
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
    lines.push(" " + codeLine);
    if (index === start.line) {
      if (range.isSingleLine) {
        lines.push(serializeRange(start, end));
      } else {
        lines.push(serializeStartRange(start, codeLine.length));
      }
    } else if (index === end.line) {
      lines.push(serializeEndRange(end));
    }
  });

  return lines.join("\n");
}

function serializeRange(start: Position, end: Position): string {
  return [
    new Array(start.character + 1).join(" "),
    "[",
    new Array(end.character - start.character + 1).join("-"),
    "]",
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

function getScope(facetId: string): ScopeType {
  if (facetId.endsWith(".name")) {
    return { type: "name" };
  }
  if (facetId.endsWith(".value")) {
    return { type: "value" };
  }
  if (facetId.endsWith("function")) {
    return { type: "namedFunction" };
  }
  if (facetId.endsWith("line")) {
    return { type: "line" };
  }
  if (facetId.endsWith("paragraph")) {
    return { type: "paragraph" };
  }
  throw Error(`Unknown facetId ${facetId}`);
}
