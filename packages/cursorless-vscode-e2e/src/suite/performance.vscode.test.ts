import {
  asyncSafety,
  type ActionDescriptor,
  type ScopeType,
  type SimpleScopeTypeType,
} from "@cursorless/common";
import { openNewEditor, runCursorlessCommand } from "@cursorless/vscode-common";
import assert from "assert";
import * as vscode from "vscode";
import { endToEndTestSetup } from "../endToEndTestSetup";

const testData = generateTestData(100);
const shortTestData = generateTestData(30);

const textBasedConfig: TestConfig = { thresholdMs: 100, testData };
const parseTreeConfig: TestConfig = { thresholdMs: 500, testData };
const surroundingPairConfig: TestConfig = {
  thresholdMs: 500,
  testData: shortTestData,
};

suite("Performance", async function () {
  endToEndTestSetup(this);

  let previousTitle = "";

  this.beforeEach(function () {
    const title = this.currentTest!.title;
    if (title !== previousTitle) {
      console.log(`    ${title}`);
      previousTitle = title;
    }
  });

  test(
    "Remove token",
    asyncSafety(() => removeToken(textBasedConfig)),
  );

  const fixtures: [SimpleScopeTypeType | ScopeType, TestConfig][] = [
    // Text based
    ["character", textBasedConfig],
    ["word", textBasedConfig],
    ["token", textBasedConfig],
    ["identifier", textBasedConfig],
    ["line", textBasedConfig],
    ["sentence", textBasedConfig],
    ["paragraph", textBasedConfig],
    ["document", textBasedConfig],
    ["nonWhitespaceSequence", textBasedConfig],
    // Parse tree based
    ["string", parseTreeConfig],
    ["map", parseTreeConfig],
    ["collectionKey", parseTreeConfig],
    ["value", parseTreeConfig],
    // Text based, but utilizes surrounding pair
    ["boundedParagraph", surroundingPairConfig],
    ["boundedNonWhitespaceSequence", surroundingPairConfig],
    ["collectionItem", surroundingPairConfig],
    // Surrounding pair
    [{ type: "surroundingPair", delimiter: "any" }, surroundingPairConfig],
    [
      { type: "surroundingPair", delimiter: "curlyBrackets" },
      surroundingPairConfig,
    ],
  ];

  for (const [scope, threshold] of fixtures) {
    const [scopeType, title] = getScopeTypeAndTitle(scope);
    test(
      `Select ${title}`,
      asyncSafety(() => selectScopeType(scopeType, threshold)),
    );
  }
});

async function removeToken(config: TestConfig) {
  await testPerformance(config, {
    name: "remove",
    target: {
      type: "primitive",
      modifiers: [{ type: "containingScope", scopeType: { type: "token" } }],
    },
  });
}

async function selectScopeType(scopeType: ScopeType, config: TestConfig) {
  await testPerformance(config, {
    name: "setSelection",
    target: {
      type: "primitive",
      modifiers: [{ type: "containingScope", scopeType }],
    },
  });
}

async function testPerformance(config: TestConfig, action: ActionDescriptor) {
  const { testData, thresholdMs } = config;
  const editor = await openNewEditor(testData, { languageId: "json" });
  const position = new vscode.Position(editor.document.lineCount - 3, 5);
  const selection = new vscode.Selection(position, position);
  editor.selections = [selection];
  editor.revealRange(selection);

  const start = performance.now();

  await runCursorlessCommand({
    version: 7,
    usePrePhraseSnapshot: false,
    action,
  });

  const duration = Math.round(performance.now() - start);

  console.log(`      ${duration} ms`);

  assert.ok(
    duration < thresholdMs,
    `Duration ${duration}ms exceeds threshold ${thresholdMs}ms`,
  );
}

function getScopeTypeAndTitle(
  scope: SimpleScopeTypeType | ScopeType,
): [ScopeType, string] {
  if (typeof scope === "string") {
    return [{ type: scope }, scope];
  }
  switch (scope.type) {
    case "surroundingPair":
      return [scope, `${scope.type}.${scope.delimiter}`];
  }
  throw Error(`Unexpected scope type: ${scope.type}`);
}

/**
 * Generate a large JSON object with n-keys, each with n-values.
 * {
 *   "0": { "0": "value", ..., "n-1": "value" },
 *   ...
 *   "n-1": { "0": "value", ..., "n-1": "value" }
 * }
 */
function generateTestData(n: number): string {
  const value = Object.fromEntries(
    new Array(n).fill("").map((_, i) => [i.toString(), "value"]),
  );
  const obj = Object.fromEntries(
    new Array(n).fill("").map((_, i) => [i.toString(), value]),
  );
  return JSON.stringify(obj, null, 2);
}

interface TestConfig {
  thresholdMs: number;
  testData: string;
}
