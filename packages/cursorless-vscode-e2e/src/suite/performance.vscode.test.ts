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

suite(`Performance: ${numLines} lines JSON`, async function () {
  endToEndTestSetup(this);

  this.beforeEach(function () {
    // console.log("before");
    // console.log(a.name);
    console.log(this.test?.title);
    console.log(this.test?.id);
  });

  this.afterAll(() => {
    console.log("Done!");
  });

  const scopeTypeTypes: Partial<Record<SimpleScopeTypeType, number>> = {
    character: 100,
    word: 100,
    token: 100,
    identifier: 100,
    line: 100,
    sentence: 100,
    paragraph: 100,
    // boundedParagraph: 100,
    document: 100,
    nonWhitespaceSequence: 100,
    // boundedNonWhitespaceSequence: 300,
    // string: 100,
    map: 100,
    // collectionKey: 300,
    // value: 15000,
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

  //   test(
  //     "Select any surrounding pair",
  //     asyncSafety(() =>
  //       selectScopeType({ type: "surroundingPair", delimiter: "any" }, 300),
  //     ),
  //   );

  test(
    "Remove token",
    asyncSafety(() => removeToken()),
  );
});

async function removeToken() {
  await testPerformance(100, {
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

  console.debug(`\t${duration} ms`);

  assert.ok(
    duration < threshold,
    `Duration ${duration}ms exceeds threshold ${threshold}ms`,
  );
}
