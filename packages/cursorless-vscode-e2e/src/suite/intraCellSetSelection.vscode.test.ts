import { LATEST_VERSION, splitKey } from "@cursorless/common";
import {
  getCellIndex,
  getCursorlessApi,
  openNewNotebookEditor,
  runCursorlessCommand,
} from "@cursorless/vscode-common";
import assert from "assert";
import { window } from "vscode";
import { endToEndTestSetup } from "../endToEndTestSetup";

// Check that setSelection is able to focus the correct cell
suite("Within cell set selection", async function () {
  endToEndTestSetup(this);

  test("Within cell set selection", runTest);
});

async function runTest() {
  const { hatTokenMap, toVscodeEditor } = (await getCursorlessApi())
    .testHelpers!;

  const notebook = await openNewNotebookEditor(['"hello world"']);

  await hatTokenMap.allocateHats();
  const hatMap = await hatTokenMap.getReadableMap(false);
  const targetHat = hatMap.getEntries().find(([, token]) => {
    const editor = toVscodeEditor(token.editor);
    return (
      getCellIndex(notebook, editor.document) === 0 && token.text === "world"
    );
  });

  if (targetHat == null) {
    assert.fail('Expected a default hat for "world" in the cell');
  }
  const { hatStyle, character } = splitKey(targetHat[0]);

  await runCursorlessCommand({
    version: LATEST_VERSION,
    usePrePhraseSnapshot: false,
    action: {
      name: "setSelection",
      target: {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: hatStyle,
          character,
        },
      },
    },
  });

  const editor = window.activeTextEditor;

  if (editor == null) {
    assert.fail("No editor was focused");
  }

  assert.deepStrictEqual(editor.document.getText(editor.selection), "world");
}
