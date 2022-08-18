import * as assert from "assert";
import * as vscode from "vscode";
import { openNewEditor } from "../openNewEditor";
import { standardSuiteSetup } from "./standardSuiteSetup";

suite("fold", async function () {
  standardSuiteSetup(this);

  test("fold made", foldMade);
  test("unfold made", unfoldMade);
});

async function foldMade() {
  const editor = await openNewEditor("function myFunk() {\n\n}", "typescript");

  await vscode.commands.executeCommand(
    "cursorless.command",
    "fold made",
    "fold",
    [
      {
        type: "primitive",
        mark: {
          type: "cursor",
        },
      },
    ]
  );

  assert.equal(editor.visibleRanges.length, 2);
  assert.equal(editor.visibleRanges[0].start.line, 0);
  assert.equal(editor.visibleRanges[0].end.line, 0);
  assert.equal(editor.visibleRanges[1].start.line, 2);
  assert.equal(editor.visibleRanges[1].start.line, 2);
}

async function unfoldMade() {
  const editor = await openNewEditor("function myFunk() {\n\n}", "typescript");
  await vscode.commands.executeCommand("editor.fold", {
    selectionLines: [0],
  });

  assert.equal(editor.visibleRanges.length, 2);

  await vscode.commands.executeCommand(
    "cursorless.command",
    "unfold made",
    "unfold",
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
}
