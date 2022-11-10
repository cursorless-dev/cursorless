import { getCursorlessApi } from "@cursorless/vscode-common";
import { assert } from "chai";
import * as vscode from "vscode";
import { openNewEditor } from "../openNewEditor";
import { runCursorlessCommand } from "../runCommand";
import { endToEndTestSetup } from "../endToEndTestSetup";

// Check that we don't run afoul of stateful regex craziness
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#finding_successive_matches
// When this fails, the regex that checks if something is an identifier will start at the wrong place the second time it is called
suite("Take token twice", async function () {
  endToEndTestSetup(this);

  test("Take token twice", runTest);
});

async function runTest() {
  const { graph } = (await getCursorlessApi()).testHelpers!;
  const editor = await openNewEditor("a)");
  await graph.hatTokenMap.addDecorations();

  for (let i = 0; i < 2; ++i) {
    editor.selection = new vscode.Selection(0, 1, 0, 1);

    await runCursorlessCommand({
      version: 3,
      action: { name: "setSelection" },
      usePrePhraseSnapshot: false,
      targets: [
        {
          type: "primitive",
          modifiers: [
            { type: "containingScope", scopeType: { type: "token" } },
          ],
          mark: { type: "cursor" },
        },
      ],
    });

    assert.isTrue(editor.selection.isEqual(new vscode.Selection(0, 0, 0, 1)));
  }
}
