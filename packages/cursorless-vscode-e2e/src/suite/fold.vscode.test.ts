import * as assert from "assert";
import * as vscode from "vscode";
import { openNewEditor } from "@cursorless/vscode-common";
import { endToEndTestSetup } from "../endToEndTestSetup";
import { runCursorlessCommand } from "@cursorless/vscode-common";

suite("fold", async function () {
  endToEndTestSetup(this);

  test("fold made", foldMade);
  test("unfold made", unfoldMade);
});

async function foldMade() {
  const editor = await openNewEditor("function myFunk() {\n\n}", {
    languageId: "typescript",
  });

  await runCursorlessCommand({
    version: 1,
    action: "fold",
    targets: [
      {
        type: "primitive",
        mark: {
          type: "cursor",
        },
      },
    ],
  });

  assert.equal(editor.visibleRanges.length, 2);
  assert.equal(editor.visibleRanges[0].start.line, 0);
  assert.equal(editor.visibleRanges[0].end.line, 0);
  assert.equal(editor.visibleRanges[1].start.line, 2);
  assert.equal(editor.visibleRanges[1].start.line, 2);
}

async function unfoldMade() {
  const editor = await openNewEditor("function myFunk() {\n\n}", {
    languageId: "typescript",
  });
  await vscode.commands.executeCommand("editor.fold", {
    selectionLines: [0],
  });

  assert.equal(editor.visibleRanges.length, 2);

  await runCursorlessCommand({
    version: 1,
    action: "unfold",
    targets: [
      {
        type: "primitive",
        mark: {
          type: "cursor",
        },
      },
    ],
  });

  assert.equal(editor.visibleRanges.length, 1);
}
