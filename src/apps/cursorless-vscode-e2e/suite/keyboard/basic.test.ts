import { getCursorlessApi, openNewEditor } from "@cursorless/vscode-common";
import { assert } from "chai";
import * as vscode from "vscode";
import { endToEndTestSetup } from "../../endToEndTestSetup";

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
  await Promise.all([
    vscode.commands.executeCommand("type", { text: "d" }),
    vscode.commands.executeCommand("type", { text: "f" }),
  ]);

  // Target containing function
  await Promise.all([
    vscode.commands.executeCommand("type", { text: "s" }),
    vscode.commands.executeCommand("type", { text: "f" }),
  ]);

  // Select target
  await vscode.commands.executeCommand("type", { text: "t" });

  assert.isTrue(editor.selection.isEqual(new vscode.Selection(0, 0, 0, 17)));

  // Turn off modal mode and try typing something
  await vscode.commands.executeCommand("cursorless.keyboard.modal.modeOff");
  await vscode.commands.executeCommand("type", { text: "a" });

  assert.equal(editor.document.getText(), "a");
}
