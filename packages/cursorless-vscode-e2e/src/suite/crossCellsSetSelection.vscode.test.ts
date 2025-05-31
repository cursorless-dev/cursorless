import {
  getCursorlessApi,
  openNewNotebookEditor,
  runCursorlessCommand,
} from "@cursorless/vscode-common";
import assert from "assert";
import { window } from "vscode";
import { endToEndTestSetup } from "../endToEndTestSetup";

// Check that setSelection is able to focus the correct cell
suite("Cross-cell set selection", async function () {
  endToEndTestSetup(this);

  test("Cross-cell set selection", runTest);
});

async function runTest() {
  const { hatTokenMap } = (await getCursorlessApi()).testHelpers!;

  await openNewNotebookEditor(['"hello"', '"world"']);

  await hatTokenMap.allocateHats();

  await runCursorlessCommand({
    version: 1,
    action: "setSelection",
    targets: [
      {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character: "r",
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
