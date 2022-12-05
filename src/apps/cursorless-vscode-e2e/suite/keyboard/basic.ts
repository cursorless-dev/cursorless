import { getCursorlessApi, openNewEditor } from "@cursorless/vscode-common";
import { assert } from "chai";
import * as vscode from "vscode";
import { endToEndTestSetup } from "../../endToEndTestSetup";

// Check that we don't run afoul of stateful regex craziness
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#finding_successive_matches
// When this fails, the regex that checks if something is an identifier will start at the wrong place the second time it is called
suite("Basic keyboard test", async function () {
  const { getOriginalIde } = endToEndTestSetup(this);

  test("Basic", () => runTest(getOriginalIde()));
});

async function runTest(ide: NormalizedIDE) {
  const { graph } = (await getCursorlessApi()).testHelpers!;

  const editor = await openNewEditor("function foo() {}", "typescript");
  await graph.hatTokenMap.addDecorations();

  editor.selection = new vscode.Selection(0, 1, 0, 1);

  await vscode.commands.executeCommand("cursorless.keyboard.modal.modeOn");
  await vscode.commands.executeCommand("type", { text: "a" });

  assert.isTrue(editor.selection.isEqual(new vscode.Selection(0, 0, 0, 1)));
}
