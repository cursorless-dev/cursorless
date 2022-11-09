import { getCellIndex, getCursorlessApi } from "@cursorless/vscode-common";
import * as assert from "assert";
import { window } from "vscode";
import { getPlainNotebookContents } from "../notebook";
import { openNewNotebookEditor } from "../openNewEditor";
import { runCursorlessCommand } from "../runCommand";
import { sleepWithBackoff, endToEndTestSetup } from "../endToEndTestSetup";

// Check that setSelection is able to focus the correct cell
suite("Edit new cell", async function () {
  endToEndTestSetup(this);

  test("drink cell", () =>
    runTest("drink cell", "editNewLineBefore", 0, ["", "hello"]));
  test("pour cell", () =>
    runTest("pour cell", "editNewLineAfter", 1, ["hello", ""]));
});

async function runTest(
  spokenForm: string,
  command: string,
  expectedActiveCellIndex: number,
  expectedNotebookContents: string[],
) {
  const { graph } = (await getCursorlessApi()).testHelpers!;
  const notebook = await openNewNotebookEditor(["hello"]);

  // FIXME: There seems to be some timing issue when you create a notebook
  // editor
  await sleepWithBackoff(1000);

  await graph.hatTokenMap.addDecorations();

  assert.equal(notebook.cellCount, 1);

  await runCursorlessCommand({
    version: 1,
    action: command,
    targets: [
      {
        type: "primitive",
        selectionType: "notebookCell",
        mark: {
          type: "cursor",
        },
      },
    ],
  });

  assert.equal(notebook.cellCount, 2);

  const activeCelIndex = getCellIndex(
    notebook,
    // eslint-disable-next-line no-restricted-properties
    window.activeTextEditor!.document,
  );

  assert.equal(activeCelIndex, expectedActiveCellIndex);

  assert.deepStrictEqual(
    getPlainNotebookContents(notebook),
    expectedNotebookContents,
  );
}
