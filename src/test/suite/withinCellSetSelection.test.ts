import * as assert from "assert";
import * as vscode from "vscode";
import * as sinon from "sinon";
import { getCursorlessApi } from "../../util/getExtensionApi";
import { openNewNotebookEditor } from "../openNewEditor";
import sleep from "../../util/sleep";

// Check that setSelection is able to focus the correct cell
suite("Within cell set selection", async function () {
  this.timeout("100s");
  this.retries(3);

  teardown(() => {
    sinon.restore();
  });

  test("Within cell set selection", runTest);
});

async function runTest() {
  const graph = (await getCursorlessApi()).graph!;

  await openNewNotebookEditor(['"hello world"']);

  // FIXME: There seems to be some timing issue when you create a notebook
  // editor
  await sleep(1000);

  await graph.hatTokenMap.addDecorations();

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
