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

const textBasedThresholdMs = 100;
const parseTreeThresholdMs = 500;
const surroundingPairThresholdMs = 500;

suite("Performance", async function () {
  endToEndTestSetup(this);

  let previousTitle = "";

  // Before each test, print the test title. This is done we have the test
  // title before the test run time / duration.
  this.beforeEach(function () {
    const title = this.currentTest!.title;
    if (title !== previousTitle) {
      console.log(`    ${title}`);
      previousTitle = title;
    }
  });

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

async function removeToken(thresholdMs: number) {
  await testPerformance(thresholdMs, {
    name: "remove",
    target: {
      type: "primitive",
      modifiers: [{ type: "containingScope", scopeType: { type: "token" } }],
    },
  });
}

async function selectScopeType(scopeType: ScopeType, thresholdMs: number) {
  await testPerformance(thresholdMs, {
    name: "setSelection",
    target: {
      type: "primitive",
      modifiers: [{ type: "containingScope", scopeType }],
    },
  });
}

async function testPerformance(thresholdMs: number, action: ActionDescriptor) {
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
