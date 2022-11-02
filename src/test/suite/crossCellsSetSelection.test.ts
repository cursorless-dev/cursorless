import * as assert from "assert";
import * as vscode from "vscode";
import { runCursorlessCommand } from "../../core/commandRunner/CommandRunner";
import { getCursorlessApi } from "../../util/getExtensionApi";
import { openNewNotebookEditor } from "../openNewEditor";
import { sleepWithBackoff, standardSuiteSetup } from "./standardSuiteSetup";

// Check that setSelection is able to focus the correct cell
suite("Cross-cell set selection", async function () {
  standardSuiteSetup(this);

  test("Cross-cell set selection", runTest);
});

async function runTest() {
  const graph = (await getCursorlessApi()).graph!;

  await openNewNotebookEditor(['"hello"', '"world"']);

  // FIXME: There seems to be some timing issue when you create a notebook
  // editor
  await sleepWithBackoff(1000);

  await graph.hatTokenMap.addDecorations();

  await runCursorlessCommand({
    version: 1,
    action: "setSelection",
    targets: [
      {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character: "w",
        },
      },
    ],
  });

  const editor = vscode.window.activeTextEditor;

  if (editor == null) {
    assert(false, "No editor was focused");
  }

  assert.deepStrictEqual(editor.document.getText(editor.selection), "world");
}
