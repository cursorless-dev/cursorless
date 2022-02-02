import * as assert from "assert";
import * as vscode from "vscode";
import * as sinon from "sinon";
import { getCursorlessApi } from "../../util/getExtensionApi";
import { openNewEditor } from "../openNewEditor";

suite("scroll", async function () {
  this.timeout("100s");
  this.retries(3);

  teardown(() => {
    sinon.restore();
  });

  test("top whale", topWhale);
  test("bottom whale", bottomWhale);
});

async function topWhale() {
  const graph = (await getCursorlessApi()).graph!;
  const editor = await openNewEditor("hello\nworld");
  await graph.hatTokenMap.addDecorations();

  await vscode.commands.executeCommand(
    "cursorless.command",
    "crown whale",
    "scrollToTop",
    [
      {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character: "w",
        },
      },
    ]
  );

  assert.equal(editor.visibleRanges.length, 1);
  assert.equal(editor.visibleRanges[0].start.line, 1);
}

async function bottomWhale() {
  const graph = (await getCursorlessApi()).graph!;
  const editor = await openNewEditor("hello\nworld");
  await vscode.commands.executeCommand("revealLine", {
    lineNumber: 1,
    at: "top",
  });
  await graph.hatTokenMap.addDecorations();

  assert.equal(editor.visibleRanges[0].start.line, 1);

  await vscode.commands.executeCommand(
    "cursorless.command",
    "bottom whale",
    "scrollToBottom",
    [
      {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character: "w",
        },
      },
    ]
  );

  assert.equal(editor.visibleRanges.length, 1);
  assert.equal(editor.visibleRanges[0].start.line, 0);
}
