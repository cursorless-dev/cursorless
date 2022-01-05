import * as assert from "assert";
import * as vscode from "vscode";
import * as sinon from "sinon";
import { getCursorlessApi } from "../../util/getExtensionApi";
import { openNewEditor, openNewNotebookEditor } from "../openNewEditor";
import sleep from "../../util/sleep";

suite("Cross-cell set selection", async function () {
  this.timeout("100s");
  this.retries(3);

  teardown(() => {
    sinon.restore();
  });

  test("Cross-cell set selection", runTest);
});

async function runTest() {
  const graph = (await getCursorlessApi()).graph!;

  await openNewNotebookEditor(['"hello"', '"world"']);

  await graph.hatTokenMap.addDecorations();

  await sleep(500);

  await vscode.commands.executeCommand(
    "cursorless.command",
    "take whale",
    "setSelection",
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

  const editor = vscode.window.activeTextEditor;

  if (editor == null) {
    assert(false, "No editor was focused");
  }

  assert.deepStrictEqual(editor.document.getText(editor.selection), "world");
}
