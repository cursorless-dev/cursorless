import { getCursorlessApi } from "@cursorless/vscode-common";
import * as assert from "assert";
import { window } from "vscode";
import { openNewNotebookEditor } from "../openNewEditor";
import { runCursorlessCommand } from "../runCommand";
import { sleepWithBackoff, endToEndTestSetup } from "../endToEndTestSetup";

// Check that setSelection is able to focus the correct cell
suite("Cross-cell set selection", async function () {
  endToEndTestSetup(this);

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

  // eslint-disable-next-line no-restricted-properties
  const editor = window.activeTextEditor;

  if (editor == null) {
    assert(false, "No editor was focused");
  }

  assert.deepStrictEqual(editor.document.getText(editor.selection), "world");
}
