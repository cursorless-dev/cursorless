import { getCursorlessApi, openNewEditor } from "@cursorless/vscode-common";
import { assert } from "chai";
import * as vscode from "vscode";
import { endToEndTestSetup, sleepWithBackoff } from "../../endToEndTestSetup";
import sinon from "sinon";
import path from "path";
import { getCursorlessRepoRoot } from "@cursorless/common";
import { readFile } from "node:fs/promises";

interface TestCase {
  name: string;
  initialContent: string;
  /**
   * The sequence of keypresses that will be sent. The list of strings will simply
   * be concatenated before sending. We could just represent this as a single string
   * but it is more readable if each "token" is a separate string.
   */
  keySequence: string[];
  finalContent: string;
}

const testCases: TestCase[] = [
  {
    name: "and",
    initialContent: "x T y\n",
    // change plex and yank
    keySequence: ["dx", "fa", "dy", "c"],
    finalContent: " T \n",
  },
  {
    name: "every",
    initialContent: "a a\nb b\n",
    // change every token air
    keySequence: ["da", "*", "st", "c"],
    finalContent: " \nb b\n",
  },
  {
    name: "three",
    initialContent: "a b c d e\n",
    // change three tokens bat
    keySequence: ["db", "3", "st", "c"],
    finalContent: "a  e\n",
  },
  {
    name: "three backwards",
    initialContent: "a b c d e\n",
    // change three tokens backwards drum
    keySequence: ["dd", "-3", "st", "c"],
    finalContent: "a  e\n",
  },
  {
    name: "pair parens",
    initialContent: "a + (b + c) + d",
    // change parens bat
    keySequence: ["db", "wp", "c"],
    finalContent: "a +  + d",
  },
  {
    name: "pair string",
    initialContent: 'a + "w" + b',
    // change parens bat
    keySequence: ["dw", "wj", "c"],
    finalContent: "a +  + b",
  },
  {
    name: "inside",
    initialContent: "(aaa)",
    // change inside air
    keySequence: ["da", "mi", "c"],
    finalContent: "()",
  },
  {
    name: "inside tail curly bat",
    initialContent: "{(aaa bbb ccc)}",
    keySequence: ["db", "mt", "wb", "mi", "c"],
    finalContent: "{(aaa }",
  },
  {
    name: "wrap",
    initialContent: "a",
    // round wrap air
    keySequence: ["da", "aw", "wp"],
    finalContent: "(a)",
  },
  {
    name: "preserve keyboard target",
    initialContent: "a\n",
    // round wrap air; round wrap <keyboard target>
    keySequence: ["da", "aw", "wp", "aw", "wp"],
    finalContent: "((a))\n",
  },
  {
    name: "slice range",
    initialContent: "aaa bbb\nccc ddd",
    // keyboard air
    // keyboard slice past cap
    keySequence: ["da", "fs", "dc", "st", "c"],
    finalContent: " bbb\n ddd",
  },
  {
    name: "simple mark",
    initialContent: "aaa bbb",
    // keyboard air
    // keyboard this
    keySequence: ["da", "mc", "c"],
    finalContent: "aaa ",
  },
  {
    name: "simple mark range",
    initialContent: "aaa bbb ccc",
    // keyboard bat
    // keyboard past this
    keySequence: ["db", "fk", "mc", "c"],
    finalContent: "aaa ",
  },
  {
    name: "simple mark list",
    initialContent: "aaa bbb ccc",
    // keyboard bat
    // keyboard and this
    keySequence: ["db", "fa", "mc", "c"],
    finalContent: "aaa  ",
  },
  {
    name: "modifier range",
    initialContent: "aaa bbb ccc ddd",
    // clear bat past its next token
    keySequence: ["db", "fk", "n", "st", "c"],
    finalContent: "aaa  ddd",
  },
  {
    name: "modifier list",
    initialContent: "aaa bbb ccc ddd",
    // clear bat and its second next token
    keySequence: ["db", "fa", "2", "n", "st", "c"],
    finalContent: "aaa  ccc ",
  },
  {
    name: "repeat command",
    initialContent: "aaa bbb ccc ddd",
    // keyboard air
    // keyboard next token twice
    // clear keyboard
    keySequence: ["da", "nst", " ", "c"],
    finalContent: "aaa bbb  ddd",
  },
  {
    name: "keyboard undo",
    initialContent: "aaa bbb",
    // keyboard air
    // keyboard bat
    // undo keyboard
    // clear
    keySequence: ["da", "db", "vu", "c"],
    finalContent: " bbb",
  },
  {
    name: "keyboard redo",
    initialContent: "aaa bbb",
    // keyboard air
    // keyboard bat
    // undo keyboard
    // redo keyboard
    // clear
    keySequence: ["da", "db", "vu", "vr", "c"],
    finalContent: "aaa ",
  },
];

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
  for (const t of testCases) {
    test("Sequence " + t.name, () => sequence(t));
  }
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

  // Target default o
  await typeText("do");

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

/**
 * sequence runs a test keyboard sequences.
 */
async function sequence(t: TestCase) {
  const { hatTokenMap } = (await getCursorlessApi()).testHelpers!;

  const editor = await openNewEditor(t.initialContent, {
    languageId: "typescript",
  });
  await hatTokenMap.allocateHats();
  editor.selection = new vscode.Selection(1, 0, 1, 0);
  await vscode.commands.executeCommand("cursorless.keyboard.modal.modeOn");
  await typeText(t.keySequence.join(""));
  assert.equal(editor.document.getText(), t.finalContent);
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
