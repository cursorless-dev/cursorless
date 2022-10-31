import * as assert from "assert";
import * as vscode from "vscode";
import { getCursorlessApi } from "../../util/getExtensionApi";
import { openNewNotebookEditor } from "../openNewEditor";
import { sleepWithBackoff, standardSuiteSetup } from "./standardSuiteSetup";
import { getActiveEditor } from "../../ide/activeEditor";

// Check that setSelection is able to focus the correct cell
suite("Within cell set selection", async function () {
  standardSuiteSetup(this);

  test("Within cell set selection", runTest);
});

async function runTest() {
  const graph = (await getCursorlessApi()).graph!;

  await openNewNotebookEditor(['"hello world"']);

  // FIXME: There seems to be some timing issue when you create a notebook
  // editor
  await sleepWithBackoff(1000);

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
    ],
  );

  const editor = getActiveEditor();

  if (editor == null) {
    assert(false, "No editor was focused");
  }

  assert.deepStrictEqual(editor.document.getText(editor.selection), "world");
}
