import type {
  ActionDescriptor,
  Modifier,
  ScopeType,
  SimpleScopeTypeType,
} from "@cursorless/lib-common";
import { asyncSafety } from "@cursorless/lib-common";
import {
  getReusableEditor,
  runCursorlessAction,
} from "@cursorless/lib-vscode-common";
import assert from "assert";
import * as vscode from "vscode";
import { endToEndTestSetup } from "../endToEndTestSetup";
import { isCI } from "../isCI";
import { isMac } from "@cursorless/lib-node-common";

const testData = generateTestData(100);
const multiplier = calculateMultiplier();
const smallThresholdMs = 50 * multiplier;
const midThresholdMs = 200 * multiplier;
const largeThresholdMs = 300 * multiplier;
const xlThresholdMs = 400 * multiplier;
const thresholds = [
  smallThresholdMs,
  midThresholdMs,
  largeThresholdMs,
  xlThresholdMs,
];

type ModifierType = "containing" | "previous" | "every";

suite(`Performance ${thresholds.join("/")} ms`, async function () {
  endToEndTestSetup(this);

  let previousTitle = "";

  // Before each test, print the test title. This is done so we have the test
  // title before the test run time / duration.
  this.beforeEach(function () {
    // FIXME: This test is flaky on Mac CI, so we skip it there for now
    if (isCI() && isMac()) {
      this.skip();
      return;
    }

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
    // Parse tree based, containing / every scope
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
    ["collectionItem", largeThresholdMs, "every"],
    ["collectionItem", largeThresholdMs, "previous"],
    // Surrounding pair
    [{ type: "surroundingPair", delimiter: "curlyBrackets" }, midThresholdMs],
    [{ type: "surroundingPair", delimiter: "any" }, midThresholdMs],
    [{ type: "surroundingPair", delimiter: "any" }, midThresholdMs, "every"],
    [{ type: "surroundingPair", delimiter: "any" }, midThresholdMs, "previous"],
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
    "Select collectionKey with multiple cursors",
    asyncSafety(() =>
      selectWithMultipleCursors(smallThresholdMs, {
        type: "collectionKey",
      }),
    ),
  );

  test(
    "Select collectionItem with multiple cursors",
    asyncSafety(() =>
      selectWithMultipleCursors(midThresholdMs, {
        type: "collectionItem",
      }),
    ),
  );

  test(
    "Select surroundingPair.any with multiple cursors",
    asyncSafety(() =>
      selectWithMultipleCursors(xlThresholdMs, {
        type: "surroundingPair",
        delimiter: "any",
      }),
    ),
  );

  test(
    "Swap key / value with multiple cursors",
    asyncSafety(() =>
      testWithMultipleCursors(midThresholdMs, {
        name: "swapTargets",
        target1: {
          type: "primitive",
          modifiers: [getModifier({ type: "collectionKey" })],
        },
        target2: {
          type: "primitive",
          modifiers: [getModifier({ type: "value" })],
        },
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
  return testWithMultipleCursors(thresholdMs, {
    name: "setSelection",
    target: {
      type: "primitive",
      modifiers: [getModifier(scopeType)],
    },
  });
}

function testWithMultipleCursors(
  thresholdMs: number,
  action: ActionDescriptor,
) {
  const beforeCallback = async (editor: vscode.TextEditor) => {
    await runCursorlessAction({
      name: "setSelectionBefore",
      target: {
        type: "primitive",
        modifiers: [getModifier({ type: "collectionItem" }, "every")],
      },
    });

    assert.equal(editor.selections.length, 100, "Expected 100 cursors");
  };

  const callback = () => runCursorlessAction(action);
  return testPerformanceCallback(thresholdMs, callback, beforeCallback);
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
  beforeCallback?: (editor: vscode.TextEditor) => Promise<unknown>,
) {
  const editor = await getReusableEditor(testData, "json");
  // This is the position of the last json key in the document
  const position = new vscode.Position(editor.document.lineCount - 3, 5);
  const selection = new vscode.Selection(position, position);
  editor.selections = [selection];
  editor.revealRange(selection);

  if (beforeCallback != null) {
    await beforeCallback(editor);
  }

  const start = performance.now();

  await callback();

  const duration = Math.round(performance.now() - start);

  console.log(`      ${duration} / ${thresholdMs} ms`);

  assert.ok(
    duration <= thresholdMs,
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
    Array.from({ length: n }, (_, i) => [i.toString(), "value"]),
  );
  const obj = Object.fromEntries(
    Array.from({ length: n }, (_, i) => [i.toString(), value]),
  );
  return JSON.stringify(obj, null, 2);
}

function calculateMultiplier() {
  // The GitHub test runner is generally slower than running tests locally, so
  // we increase the thresholds in CI.
  if (isCI()) {
    return 2;
  }
  return 1;
}
