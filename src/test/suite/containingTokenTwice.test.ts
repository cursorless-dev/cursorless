import { assert } from "chai";
import * as vscode from "vscode";
import { CommandV3 } from "../../core/commandRunner/command.types";
import { getCursorlessApi } from "../../util/getExtensionApi";
import { openNewEditor } from "../openNewEditor";
import { standardSuiteSetup } from "./standardSuiteSetup";

suite("Take token twice", async function () {
  standardSuiteSetup(this);

  test("Take token twice", runTest);
});

async function runTest() {
  const graph = (await getCursorlessApi()).graph!;
  const editor = await openNewEditor("a)");
  await graph.hatTokenMap.addDecorations();

  for (let i = 0; i < 2; ++i) {
    editor.selection = new vscode.Selection(0, 1, 0, 1);

    const command: CommandV3 = {
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
    };

    await vscode.commands.executeCommand("cursorless.command", command);

    assert.isTrue(editor.selection.isEqual(new vscode.Selection(0, 0, 0, 1)));
  }
}
