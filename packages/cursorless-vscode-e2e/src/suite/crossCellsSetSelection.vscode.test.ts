import { isLinux } from "@cursorless/node-common";
import {
  getCursorlessApi,
  openNewNotebookEditor,
  runCursorlessCommand,
} from "@cursorless/vscode-common";
import assert from "assert";
import { window } from "vscode";
import { endToEndTestSetup } from "../endToEndTestSetup";
import { isCI } from "../isCI";

// Check that setSelection is able to focus the correct cell
suite("Cross-cell set selection", async function () {
  // FIXME: This test is flaky on Linux CI, so we skip it there for now
  if (isCI() && isLinux()) {
    this.ctx.skip();
  }

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
          character: "o",
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
