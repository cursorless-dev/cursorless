import { getCursorlessApi, openNewEditor } from "@cursorless/vscode-common";
import { assert } from "chai";
import * as vscode from "vscode";
import { endToEndTestSetup, sleepWithBackoff } from "../../endToEndTestSetup";

suite("Basic keyboard test", async function () {
  endToEndTestSetup(this);

  test("Basic keyboard test", () => runTest());
});

async function runTest() {
  const { graph } = (await getCursorlessApi()).testHelpers!;

  const editor = await openNewEditor("function foo() {}\n", "typescript");
  await graph.hatTokenMap.addDecorations();

  editor.selection = new vscode.Selection(1, 0, 1, 0);

  await vscode.commands.executeCommand("cursorless.keyboard.modal.modeOn");

  // Target default f
  await typeText("df");

  // Target containing function
  await typeText("sf");

  // Select target
  await typeText("t");

  assert.isTrue(editor.selection.isEqual(new vscode.Selection(0, 0, 0, 17)));

  // Turn off modal mode and try typing something
  await vscode.commands.executeCommand("cursorless.keyboard.modal.modeOff");
  await typeText("a");

  assert.equal(editor.document.getText().trim(), "a");
}

async function typeText(text: string) {
  for (const char of text) {
    vscode.commands.executeCommand("type", { text: char });
    // Note we just hack by using sleep because awaiting is too complicated to
    // get right.
    await sleepWithBackoff(100);
  }
}
