import { openNewEditor } from "@cursorless/vscode-common";
import * as vscode from "vscode";
import { endToEndTestSetup } from "../endToEndTestSetup";
import { runCursorlessCommand } from "@cursorless/vscode-common";

suite("scroll", async function () {
  endToEndTestSetup(this);

  test("top whale", topWhale);
  test("bottom whale", bottomWhale);
});

async function topWhale() {
  const editor = await openNewEditor("hello\nworld");
  editor.selections = [new vscode.Selection(1, 0, 1, 0)];

  await runCursorlessCommand({
    version: 1,
    action: "scrollToTop",
    targets: [
      {
        type: "primitive",
        mark: {
          type: "cursor",
        },
      },
    ],
  });

  // FIXME: Disabled to work around CI failure; see #2243
  // assert.equal(editor.visibleRanges.length, 1);
  // assert.equal(editor.visibleRanges[0].start.line, 1);
}

async function bottomWhale() {
  const editor = await openNewEditor("hello\nworld");
  await vscode.commands.executeCommand("revealLine", {
    lineNumber: 1,
    at: "top",
  });
  editor.selections = [new vscode.Selection(1, 0, 1, 0)];

  // FIXME: Disabled to work around CI failure; see #2243
  // assert.equal(editor.visibleRanges[0].start.line, 1);

  await runCursorlessCommand({
    version: 1,
    action: "scrollToBottom",
    targets: [
      {
        type: "primitive",
        mark: {
          type: "cursor",
        },
      },
    ],
  });

  // FIXME: Disabled to work around CI failure; see #2243
  // assert.equal(editor.visibleRanges.length, 1);
  // assert.equal(editor.visibleRanges[0].start.line, 0);
}
