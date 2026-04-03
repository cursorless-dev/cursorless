import * as assert from "node:assert/strict";
import * as vscode from "vscode";
import { LATEST_VERSION } from "@cursorless/lib-common";
import {
  getReusableEditor,
  getTestHelpers,
  runCursorlessCommand,
} from "@cursorless/lib-vscode-common";
import { endToEndTestSetup } from "../endToEndTestSetup";

// Check that we don't run afoul of stateful regex craziness
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#finding_successive_matches
// When this fails, the regex that checks if something is an identifier will start at the wrong place the second time it is called
suite("Take token twice", function () {
  endToEndTestSetup(this);

  test("Take token twice", runTest);
});

async function runTest() {
  const { hatTokenMap } = await getTestHelpers();
  const editor = await getReusableEditor("a)");
  await hatTokenMap.allocateHats();

  for (let i = 0; i < 2; ++i) {
    editor.selection = new vscode.Selection(0, 1, 0, 1);

    await runCursorlessCommand({
      version: LATEST_VERSION,
      usePrePhraseSnapshot: false,
      action: {
        name: "setSelection",
        target: {
          type: "primitive",
          modifiers: [
            { type: "containingScope", scopeType: { type: "token" } },
          ],
          mark: { type: "cursor" },
        },
      },
    });

    assert.ok(editor.selection.isEqual(new vscode.Selection(0, 0, 0, 1)));
  }
}
