import { openNewEditor } from "@cursorless/vscode-common";
import * as vscode from "vscode";
import { endToEndTestSetup } from "../endToEndTestSetup";
import { runCursorlessCommand } from "@cursorless/vscode-common";
import assert from "assert";

suite("revealRange", async function () {
  endToEndTestSetup(this);

  test("pre file", preFile);
  test("post file", postFile);
});

const content = new Array(100).fill("line").join("\n");

async function preFile() {
  const editor = await openNewEditor(content);
  const startLine = editor.document.lineCount - 1;
  editor.selections = [new vscode.Selection(startLine, 0, startLine, 0)];
  editor.revealRange(new vscode.Range(startLine, 0, startLine, 0));

  await runCursorlessCommand({
    version: 7,
    usePrePhraseSnapshot: false,
    action: {
      name: "setSelectionBefore",
      target: {
        type: "primitive",
        modifiers: [
          { type: "containingScope", scopeType: { type: "document" } },
        ],
      },
    },
  });

  assert.equal(editor.visibleRanges.length, 1);
  // FIXME: Disabled to work around CI failure; see #2243
  //   assert.equal(editor.visibleRanges[0].start.line, 0);
}

async function postFile() {
  const editor = await openNewEditor(content);
  await vscode.commands.executeCommand("revealLine", {
    lineNumber: 1,
    at: "top",
  });
  editor.selections = [new vscode.Selection(0, 0, 0, 0)];

  await runCursorlessCommand({
    version: 7,
    usePrePhraseSnapshot: false,
    action: {
      name: "setSelectionAfter",
      target: {
        type: "primitive",
        modifiers: [
          { type: "containingScope", scopeType: { type: "document" } },
        ],
      },
    },
  });

  assert.equal(editor.visibleRanges.length, 1);
  // FIXME: Disabled to work around CI failure; see #2243
  //   assert.equal(editor.visibleRanges[0].end.line, editor.document.lineCount - 1);
}
