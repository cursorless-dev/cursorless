import * as assert from "assert";
import * as vscode from "vscode";
import { openNewEditor } from "../openNewEditor";
import { standardSuiteSetup } from "./standardSuiteSetup";

suite("scroll", async function () {
  standardSuiteSetup(this);

  test("top whale", topWhale);
  test("bottom whale", bottomWhale);
});

async function topWhale() {
  const editor = await openNewEditor("hello\nworld");
  editor.selections = [new vscode.Selection(1, 0, 1, 0)];

  await vscode.commands.executeCommand(
    "cursorless.command",
    "crown whale",
    "scrollToTop",
    [
      {
        type: "primitive",
        mark: {
          type: "cursor",
        },
      },
    ]
  );

  assert.equal(editor.visibleRanges.length, 1);
  assert.equal(editor.visibleRanges[0].start.line, 1);
}

async function bottomWhale() {
  const editor = await openNewEditor("hello\nworld");
  await vscode.commands.executeCommand("revealLine", {
    lineNumber: 1,
    at: "top",
  });
  editor.selections = [new vscode.Selection(1, 0, 1, 0)];

  assert.equal(editor.visibleRanges[0].start.line, 1);

  await vscode.commands.executeCommand(
    "cursorless.command",
    "bottom whale",
    "scrollToBottom",
    [
      {
        type: "primitive",
        mark: {
          type: "cursor",
        },
      },
    ]
  );

  assert.equal(editor.visibleRanges.length, 1);
  assert.equal(editor.visibleRanges[0].start.line, 0);
}
