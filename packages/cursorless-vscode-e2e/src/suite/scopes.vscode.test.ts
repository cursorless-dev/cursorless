import {
  asyncSafety,
  getScopeTestPaths,
  Position,
  Range,
  ScopeRanges,
  ScopeType,
} from "@cursorless/common";
import { getCursorlessApi, openNewEditor } from "@cursorless/vscode-common";
import { assert } from "chai";
import { promises as fsp } from "node:fs";
import { endToEndTestSetup } from "../endToEndTestSetup";

suite.only("scope test cases", async function () {
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

  const updatedFixture = serializesScopes(code, scopes);

  console.log(updatedFixture);
}

function serializesScopes(code: string, scopes: ScopeRanges[]): string {
  const codeLines = code.split(/\r?\n/);
  const lines: string[] = [code, "---", ""];

  for (const scope of scopes) {
    for (const target of scope.targets) {
      lines.push(renderHeader(codeLines, "Content", target.contentRange));
    }
  }

  return lines.join("\n");
}

function renderHeader(
  codeLines: string[],
  header: string,
  range: Range,
): string {
  const { start, end } = range;
  const lines: string[] = [`[${header}]`];

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
