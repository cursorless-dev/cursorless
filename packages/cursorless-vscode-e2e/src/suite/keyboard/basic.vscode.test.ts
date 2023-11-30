import { getCursorlessApi, openNewEditor } from "@cursorless/vscode-common";
import { assert } from "chai";
import * as vscode from "vscode";
import { endToEndTestSetup, sleepWithBackoff } from "../../endToEndTestSetup";

suite("Basic keyboard test", async function () {
  endToEndTestSetup(this);

  this.afterEach(async () => {
    await vscode.commands.executeCommand("cursorless.keyboard.modal.modeOff");
  });

  test("Don't take keyboard control on startup", () => checkKeyboardStartup());
  test("Basic keyboard test", () => basic());
  test("Run vscode command", () => vscodeCommand());
  test("Check that entering and leaving mode is no-op", () =>
    enterAndLeaveIsNoOp());
});

async function checkKeyboardStartup() {
  await getCursorlessApi();
  const editor = await openNewEditor("");

  // Type the letter
  await typeText("a");

  assert.equal(editor.document.getText().trim(), "a");
}

async function basic() {
  const { hatTokenMap } = (await getCursorlessApi()).testHelpers!;

  const editor = await openNewEditor("function foo() {}\n", {
    languageId: "typescript",
  });
  await hatTokenMap.allocateHats();

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

async function vscodeCommand() {
  const { hatTokenMap } = (await getCursorlessApi()).testHelpers!;

  const editor = await openNewEditor("aaa;\nbbb;\nccc;\n", {
    languageId: "typescript",
  });
  await hatTokenMap.allocateHats();

  editor.selection = new vscode.Selection(0, 0, 0, 0);

  await vscode.commands.executeCommand("cursorless.keyboard.modal.modeOn");

  // Target default b
  await typeText("db");

  // Comment line containing *selection*
  await typeText("c");
  assert.equal(editor.document.getText(), "// aaa;\nbbb;\nccc;\n");

  // Comment line containing *target*
  await typeText("mc");
  assert.equal(editor.document.getText(), "// aaa;\n// bbb;\nccc;\n");

  // Comment line containing *target*, keeping changed selection and exiting
  // cursorless mode
  await typeText("dcmma");
  assert.equal(editor.document.getText(), "// aaa;\n// bbb;\n// a;\n");

  await vscode.commands.executeCommand("cursorless.keyboard.modal.modeOff");
}

async function enterAndLeaveIsNoOp() {
  const editor = await openNewEditor("hello");

  const originalSelection = new vscode.Selection(0, 0, 0, 0);
  editor.selection = originalSelection;

  await vscode.commands.executeCommand("cursorless.keyboard.modal.modeOn");

  assert.isTrue(editor.selection.isEqual(originalSelection));

  await vscode.commands.executeCommand("cursorless.keyboard.modal.modeOff");

  assert.isTrue(editor.selection.isEqual(originalSelection));
}

async function typeText(text: string) {
  for (const char of text) {
    vscode.commands.executeCommand("type", { text: char });
    // Note we just hack by using sleep because awaiting is too complicated to
    // get right.
    await sleepWithBackoff(100);
  }
}
