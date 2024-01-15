import { getCursorlessApi, openNewEditor } from "@cursorless/vscode-common";
import { assert } from "chai";
import * as vscode from "vscode";
import { endToEndTestSetup, sleepWithBackoff } from "../../endToEndTestSetup";
import sinon from "sinon";
import path from "path";
import { getCursorlessRepoRoot } from "@cursorless/common";
import { readFile } from "node:fs/promises";

suite("Basic keyboard test", async function () {
  endToEndTestSetup(this);

  this.beforeEach(async () => {
    await injectFakes();
  });

  this.afterEach(async () => {
    await vscode.commands.executeCommand("cursorless.keyboard.modal.modeOff");
  });

  test("Don't take keyboard control on startup", () => checkKeyboardStartup());
  test("Basic keyboard test", () => basic());
  test("No automatic token expansion", () => noAutomaticTokenExpansion());
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
  await typeText("at");

  assert.isTrue(editor.selection.isEqual(new vscode.Selection(0, 0, 0, 17)));

  // Turn off modal mode and try typing something
  await vscode.commands.executeCommand("cursorless.keyboard.modal.modeOff");
  await typeText("a");

  assert.equal(editor.document.getText().trim(), "a");
}

async function noAutomaticTokenExpansion() {
  const { hatTokenMap } = (await getCursorlessApi()).testHelpers!;

  const editor = await openNewEditor("aaa");
  await hatTokenMap.allocateHats();

  editor.selection = new vscode.Selection(0, 3, 0, 3);

  await vscode.commands.executeCommand("cursorless.keyboard.modal.modeOn");

  // "pour"
  await typeText("ao");

  assert.isTrue(editor.selection.isEqual(new vscode.Selection(1, 0, 1, 0)));
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
  await typeText("va");
  assert.equal(editor.document.getText(), "// aaa;\nbbb;\nccc;\n");

  // Comment line containing *target*
  await typeText("vb");
  assert.equal(editor.document.getText(), "// aaa;\n// bbb;\nccc;\n");

  // Comment line containing *target*, keeping changed selection and exiting
  // cursorless mode
  await typeText("dcvca");
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

async function injectFakes(): Promise<void> {
  const { vscodeApi } = (await getCursorlessApi()).testHelpers!;

  const keyboardConfigPath = path.join(
    getCursorlessRepoRoot(),
    "packages/cursorless-vscode/src/keyboard/keyboard-config.fixture.json",
  );

  const keyboardConfig = JSON.parse(await readFile(keyboardConfigPath, "utf8"));

  const getConfigurationValue = sinon.fake((sectionName) => {
    return keyboardConfig[
      `cursorless.experimental.keyboard.modal.keybindings.${sectionName}`
    ];
  });

  sinon.replace(
    vscodeApi.workspace,
    "getConfiguration",
    sinon.fake((section) => {
      if (
        !section?.startsWith(
          "cursorless.experimental.keyboard.modal.keybindings",
        )
      ) {
        return vscode.workspace.getConfiguration(section);
      }

      return {
        get: getConfigurationValue,
      } as unknown as vscode.WorkspaceConfiguration;
    }),
  );
}
