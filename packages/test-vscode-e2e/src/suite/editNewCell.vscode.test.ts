import * as assert from "node:assert/strict";
import { window } from "vscode";
import { LATEST_VERSION } from "@cursorless/lib-common";
import {
  getCellIndex,
  getCursorlessApi,
  openNewNotebookEditor,
  runCursorlessCommand,
} from "@cursorless/lib-vscode-common";
import { endToEndTestSetup, sleepWithBackoff } from "../endToEndTestSetup";
import { getPlainNotebookContents } from "../notebook";

// Check that setSelection is able to focus the correct cell
suite("Edit new cell", function () {
  endToEndTestSetup(this);

  test("drink cell", () =>
    runTest("drink cell", "editNewLineBefore", 0, ["", "hello"]));
  test("pour cell", () =>
    runTest("pour cell", "editNewLineAfter", 1, ["hello", ""]));
});

async function runTest(
  spokenForm: string,
  command: "editNewLineBefore" | "editNewLineAfter",
  expectedActiveCellIndex: number,
  expectedNotebookContents: string[],
) {
  const { hatTokenMap } = (await getCursorlessApi()).testHelpers!;
  const notebook = await openNewNotebookEditor(["hello"]);

  await hatTokenMap.allocateHats();

  assert.equal(notebook.cellCount, 1);

  await runCursorlessCommand({
    version: LATEST_VERSION,
    usePrePhraseSnapshot: false,
    action: {
      name: command,
      target: {
        type: "primitive",
        modifiers: [
          { type: "containingScope", scopeType: { type: "notebookCell" } },
        ],
        mark: {
          type: "cursor",
        },
      },
    },
  });

  await sleepWithBackoff(100);

  assert.equal(notebook.cellCount, 2);

  const activeCelIndex = getCellIndex(
    notebook,
    window.activeTextEditor!.document,
  );

  assert.equal(activeCelIndex, expectedActiveCellIndex);

  assert.deepEqual(
    getPlainNotebookContents(notebook),
    expectedNotebookContents,
  );
}
