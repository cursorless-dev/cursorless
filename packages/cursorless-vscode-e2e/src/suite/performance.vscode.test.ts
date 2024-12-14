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

const obj = Object.fromEntries(
  new Array(100)
    .fill("")
    .map((_, i) => [
      i.toString(),
      Object.fromEntries(
        new Array(100).fill("").map((_, i) => [i.toString(), "value"]),
      ),
    ]),
);
const content = JSON.stringify(obj, null, 2);
const numLines = content.split("\n").length;

const textBasedThreshold = 100;
const parseTreeThreshold = 500;
const surroundingPairThreshold = 20000;

suite(`Performance: ${numLines} lines JSON`, async function () {
  endToEndTestSetup(this);

  let previousTitle = "";

  this.beforeEach(function () {
    const title = this.currentTest!.title;
    if (title !== previousTitle) {
      console.log(`    * ${title}`);
      previousTitle = title;
    }
  });

  test(
    "Remove token",
    asyncSafety(() => removeToken(textBasedThreshold)),
  );

  const scopeTypeTypes: Partial<Record<SimpleScopeTypeType, number>> = {
    // Text based
    character: textBasedThreshold,
    word: textBasedThreshold,
    token: textBasedThreshold,
    identifier: textBasedThreshold,
    line: textBasedThreshold,
    sentence: textBasedThreshold,
    paragraph: textBasedThreshold,
    document: textBasedThreshold,
    nonWhitespaceSequence: textBasedThreshold,
    // Parse tree based
    string: parseTreeThreshold,
    map: parseTreeThreshold,
    collectionKey: parseTreeThreshold,
    value: parseTreeThreshold,
    // Utilizes surrounding pair
    boundedParagraph: surroundingPairThreshold,
    boundedNonWhitespaceSequence: surroundingPairThreshold,
  };

  for (const [scopeTypeType, threshold] of Object.entries(scopeTypeTypes)) {
    test(
      `Select ${scopeTypeType}`,
      asyncSafety(() =>
        selectScopeType(
          { type: scopeTypeType as SimpleScopeTypeType },
          threshold,
        ),
      ),
    );
  }

  test(
    "Select any surrounding pair",
    asyncSafety(() =>
      selectScopeType(
        { type: "surroundingPair", delimiter: "any" },
        surroundingPairThreshold,
      ),
    ),
  );
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
  const editor = await openNewEditor(content, { languageId: "json" });
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

  console.log(`        ${duration} ms`);

  assert.ok(
    duration < threshold,
    `Duration ${duration}ms exceeds threshold ${threshold}ms`,
  );
}
