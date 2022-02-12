import * as assert from "assert";
import * as vscode from "vscode";
import * as sinon from "sinon";
import { getCursorlessApi } from "../../util/getExtensionApi";
import { openNewNotebookEditor } from "../openNewEditor";
import sleep from "../../util/sleep";

// Check that setSelection is able to focus the correct cell
suite("Edit new cell", async function () {
  this.timeout("100s");
  this.retries(3);

  teardown(() => {
    sinon.restore();
  });

  test("drink cell", () => runTest("drink cell", "editNewLineBefore"));
  test("pour cell", () => runTest("pour cell", "editNewLineAfter"));
});

async function runTest(spokenForm: string, command: string) {
  const graph = (await getCursorlessApi()).graph!;
  const notebook = await openNewNotebookEditor(["hello"]);

  // FIXME: There seems to be some timing issue when you create a notebook
  // editor
  await sleep(1000);

  await graph.hatTokenMap.addDecorations();

  assert.equal(notebook.cellCount, 1);

  await vscode.commands.executeCommand(
    "cursorless.command",
    spokenForm,
    command,
    [
      {
        type: "primitive",
        selectionType: "notebookCell",
        mark: {
          type: "cursor",
        },
      },
    ]
  );

  assert.equal(notebook.cellCount, 2);
}
