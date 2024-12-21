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

const testData = generateTestData();
const numLines = testData.split("\n").length;

suite(`Performance: ${numLines} lines JSON`, async function () {
  endToEndTestSetup(this);

  let previousTitle = "";

  this.beforeEach(function () {
    const title = this.currentTest!.title;
    if (title !== previousTitle) {
      console.log(`    ${title}`);
      previousTitle = title;
    }
  });

  const textBasedThresholdMs = 100;
  const parseTreeThresholdMs = 500;
  const surroundingPairThresholdMs = 30000;

  test(
    "Remove token",
    asyncSafety(() => removeToken(textBasedThresholdMs)),
  );

  const fixtures: [SimpleScopeTypeType | ScopeType, number][] = [
    // Text based
    ["character", textBasedThresholdMs],
    ["word", textBasedThresholdMs],
    ["token", textBasedThresholdMs],
    ["identifier", textBasedThresholdMs],
    ["line", textBasedThresholdMs],
    ["sentence", textBasedThresholdMs],
    ["paragraph", textBasedThresholdMs],
    ["document", textBasedThresholdMs],
    ["nonWhitespaceSequence", textBasedThresholdMs],
    // Parse tree based
    ["string", parseTreeThresholdMs],
    ["map", parseTreeThresholdMs],
    ["collectionKey", parseTreeThresholdMs],
    ["value", parseTreeThresholdMs],
    // Text based, but utilizes surrounding pair
    ["boundedParagraph", surroundingPairThresholdMs],
    ["boundedNonWhitespaceSequence", surroundingPairThresholdMs],
    ["collectionItem", surroundingPairThresholdMs],
    // Surrounding pair
    [{ type: "surroundingPair", delimiter: "any" }, surroundingPairThresholdMs],
    [
      { type: "surroundingPair", delimiter: "curlyBrackets" },
      surroundingPairThresholdMs,
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

async function removeToken(threshold: number) {
  await testPerformance(threshold, {
    name: "remove",
    target: {
      type: "primitive",
      modifiers: [{ type: "containingScope", scopeType: { type: "token" } }],
    },
  });
}

async function selectScopeType(scopeType: ScopeType, threshold: number) {
  await testPerformance(threshold, {
    name: "setSelection",
    target: {
      type: "primitive",
      modifiers: [{ type: "containingScope", scopeType }],
    },
  });
}

async function testPerformance(threshold: number, action: ActionDescriptor) {
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
    duration < threshold,
    `Duration ${duration}ms exceeds threshold ${threshold}ms`,
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
 * Generate a large JSON object with 100 keys, each with 100 values.
 * {
 *   "0": {  "0": "value", ..., "99": "value" },
 *   ...
 * * "99": {  "0": "value", ..., "99": "value" },
 * }
 */
function generateTestData(): string {
  const value = Object.fromEntries(
    new Array(100).fill("").map((_, i) => [i.toString(), "value"]),
  );
  const obj = Object.fromEntries(
    new Array(100).fill("").map((_, i) => [i.toString(), value]),
  );
  return JSON.stringify(obj, null, 2);
}
