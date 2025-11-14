import {
  asyncSafety,
  type ActionDescriptor,
  type Modifier,
  type ScopeType,
  type SimpleScopeTypeType,
} from "@cursorless/common";
import {
  getCursorlessApi,
  openNewEditor,
  runCursorlessAction,
} from "@cursorless/vscode-common";
import assert from "assert";
import * as vscode from "vscode";
import { endToEndTestSetup } from "../endToEndTestSetup";

const testData = generateTestData(100);

const smallThresholdMs = 100;
const largeThresholdMs = 600;
const xlThresholdMs = 1500;

type ModifierType = "containing" | "previous" | "every";

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
    asyncSafety(() => removeToken(smallThresholdMs)),
  );

  const fixtures: (
    | [SimpleScopeTypeType | ScopeType, number]
    | [SimpleScopeTypeType | ScopeType, number, ModifierType]
  )[] = [
    // Text based
    ["character", smallThresholdMs],
    ["word", smallThresholdMs],
    ["token", smallThresholdMs],
    ["identifier", smallThresholdMs],
    ["line", smallThresholdMs],
    ["sentence", smallThresholdMs],
    ["paragraph", smallThresholdMs],
    ["document", smallThresholdMs],
    ["nonWhitespaceSequence", smallThresholdMs],
    // Parse tree based, containing/every scope
    ["string", smallThresholdMs],
    ["map", smallThresholdMs],
    ["collectionKey", smallThresholdMs],
    ["value", smallThresholdMs],
    ["collectionKey", smallThresholdMs, "every"],
    ["value", smallThresholdMs, "every"],
    // Parse tree based, relative scope
    ["collectionKey", largeThresholdMs, "previous"],
    ["value", largeThresholdMs, "previous"],
    // Text based, but utilizes surrounding pair
    ["boundedParagraph", largeThresholdMs],
    ["boundedNonWhitespaceSequence", largeThresholdMs],
    ["collectionItem", largeThresholdMs],
    // Surrounding pair
    [{ type: "surroundingPair", delimiter: "any" }, largeThresholdMs],
    [{ type: "surroundingPair", delimiter: "curlyBrackets" }, largeThresholdMs],
    [{ type: "surroundingPair", delimiter: "any" }, largeThresholdMs, "every"],
    [
      { type: "surroundingPair", delimiter: "any" },
      largeThresholdMs,
      "previous",
    ],
  ];

  for (const [scope, threshold, modifierType] of fixtures) {
    const [scopeType, scopeTitle] = getScopeTypeAndTitle(scope);
    const title = modifierType
      ? `${modifierType} ${scopeTitle}`
      : `${scopeTitle}`;
    test(
      `Select ${title}`,
      asyncSafety(() => selectScopeType(scopeType, threshold, modifierType)),
    );
  }

  test(
    "Select surroundingPair with multiple cursors",
    asyncSafety(() =>
      selectWithMultipleCursors(xlThresholdMs, {
        type: "surroundingPair",
        delimiter: "any",
      }),
    ),
  );

  test(
    "Select collectionItem with multiple cursors",
    asyncSafety(() =>
      selectWithMultipleCursors(xlThresholdMs, {
        type: "collectionItem",
      }),
    ),
  );
});

function removeToken(thresholdMs: number) {
  return testPerformance(thresholdMs, {
    name: "remove",
    target: {
      type: "primitive",
      modifiers: [{ type: "containingScope", scopeType: { type: "token" } }],
    },
  });
}

function selectWithMultipleCursors(thresholdMs: number, scopeType: ScopeType) {
  return testPerformanceCallback(thresholdMs, async () => {
    await runCursorlessAction({
      name: "setSelectionBefore",
      target: {
        type: "primitive",
        modifiers: [getModifier({ type: "collectionItem" }, "every")],
      },
    });

    await runCursorlessAction({
      name: "setSelection",
      target: {
        type: "primitive",
        modifiers: [getModifier(scopeType)],
      },
    });
  });
}

function selectScopeType(
  scopeType: ScopeType,
  thresholdMs: number,
  modifierType?: ModifierType,
) {
  return testPerformance(thresholdMs, {
    name: "setSelection",
    target: {
      type: "primitive",
      modifiers: [getModifier(scopeType, modifierType)],
    },
  });
}

function testPerformance(thresholdMs: number, action: ActionDescriptor) {
  return testPerformanceCallback(thresholdMs, () => {
    return runCursorlessAction(action);
  });
}

async function testPerformanceCallback(
  thresholdMs: number,
  callback: () => Promise<unknown>,
) {
  const editor = await openNewEditor(testData, { languageId: "json" });
  // This is the position of the last json key in the document
  const position = new vscode.Position(editor.document.lineCount - 3, 5);
  const selection = new vscode.Selection(position, position);
  editor.selections = [selection];
  editor.revealRange(selection);

  (await getCursorlessApi()).testHelpers!.clearCache();

  const start = performance.now();

  await callback();

  const duration = Math.round(performance.now() - start);

  console.log(`      ${duration} ms`);

  assert.ok(
    duration < thresholdMs,
    `Duration ${duration}ms exceeds threshold ${thresholdMs}ms`,
  );
}

function getModifier(
  scopeType: ScopeType,
  modifierType: ModifierType = "containing",
): Modifier {
  switch (modifierType) {
    case "containing":
      return { type: "containingScope", scopeType };
    case "every":
      return { type: "everyScope", scopeType };
    case "previous":
      return {
        type: "relativeScope",
        direction: "backward",
        offset: 1,
        length: 1,
        scopeType,
      };
  }
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
