import {
  getCursorlessApi,
  openNewNotebookEditor,
} from "@cursorless/vscode-common";
import assert from "assert";
import { window } from "vscode";
import { endToEndTestSetup, sleepWithBackoff } from "../endToEndTestSetup";
import { runCursorlessCommand } from "@cursorless/vscode-common";

// Check that setSelection is able to focus the correct cell
suite("Within cell set selection", async function () {
  endToEndTestSetup(this);

  test("Within cell set selection", runTest);
});

async function runTest() {
  const { hatTokenMap } = (await getCursorlessApi()).testHelpers!;

  await openNewNotebookEditor(['"hello world"']);

  // FIXME: There seems to be some timing issue when you create a notebook
  // editor
  await sleepWithBackoff(1000);

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

  const editor = window.activeTextEditor; // eslint-disable-line no-restricted-properties

  if (editor == null) {
    assert(false, "No editor was focused");
  }

  assert.deepStrictEqual(editor.document.getText(editor.selection), "world");
}
