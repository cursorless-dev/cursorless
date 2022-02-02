import * as assert from "assert";
import * as vscode from "vscode";
import * as sinon from "sinon";
import { getCursorlessApi } from "../../util/getExtensionApi";
import { openNewEditor } from "../openNewEditor";

suite("breakpoints", async function () {
  this.timeout("100s");
  this.retries(3);

  teardown(() => {
    sinon.restore();
  });

  test("fold made", foldMade);
  test("unfold made", unfoldMade);
});

async function foldMade() {
  const graph = (await getCursorlessApi()).graph!;
  const editor = await openNewEditor("function myFunk() {\n\n}", "typescript");
  await graph.hatTokenMap.addDecorations();

  await vscode.commands.executeCommand(
    "cursorless.command",
    "fold made",
    "fold",
    [
      {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character: "m",
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
  const graph = (await getCursorlessApi()).graph!;
  const editor = await openNewEditor("function myFunk() {\n\n}", "typescript");
  await vscode.commands.executeCommand("editor.fold", {
    selectionLines: [0],
  });
  await graph.hatTokenMap.addDecorations();

  assert.equal(editor.visibleRanges.length, 2);

  await vscode.commands.executeCommand(
    "cursorless.command",
    "unfold made",
    "unfold",
    [
      {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character: "m",
        },
      },
    ]
  );

  assert.equal(editor.visibleRanges.length, 1);
}
