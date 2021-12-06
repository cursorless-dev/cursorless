import * as assert from "assert";
import * as vscode from "vscode";
import * as sinon from "sinon";
import { getCursorlessApi } from "../../util/getExtensionApi";
import { selectionToPlainObject } from "../../testUtil/toPlainObject";
import { mockPrePhraseGetVersion } from "../mockPrePhraseGetVersion";
import { openNewEditor } from "../openNewEditor";

/**
 * The selections we expect when the pre-phrase snapshot is used
 */
const snapshotExpectedSelections = [new vscode.Selection(0, 6, 0, 11)];

/**
 * The selections we expect when the pre-phrase snapshot is not used
 */
const noSnapshotExpectedSelections = [new vscode.Selection(1, 6, 1, 11)];

suite("Pre-phrase snapshots", async function () {
  this.timeout("100s");
  this.retries(3);

  teardown(() => {
    sinon.restore();
  });

  test("Pre-phrase snapshot; single phrase", () =>
    runTest(true, false, snapshotExpectedSelections));

  test("Pre-phrase snapshot; multiple phrase", () =>
    runTest(true, true, noSnapshotExpectedSelections));
  test("No snapshot; single phrase", () =>
    runTest(false, false, noSnapshotExpectedSelections));
  test("No snapshot; multiple phrase", () =>
    runTest(false, true, noSnapshotExpectedSelections));
});

async function runTest(
  usePrePhraseSnapshot: boolean,
  multiplePhrases: boolean,
  expectedSelections: vscode.Selection[]
) {
  const graph = (await getCursorlessApi()).graph!;

  const editor = await openNewEditor("Hello world testing whatever");

  editor.selections = [new vscode.Selection(0, 0, 0, 0)];

  let prePhraseVersion = "version1";
  mockPrePhraseGetVersion(graph, async () => prePhraseVersion);

  await graph.hatTokenMap.addDecorations();
  prePhraseVersion = "version2";

  await vscode.commands.executeCommand("cursorless.command", {
    version: 1,
    spokenForm: "whatever",
    action: "replaceWithTarget",
    targets: [
      { type: "primitive", selectionType: "line", mark: { type: "cursor" } },
      {
        type: "primitive",
        mark: { type: "cursor" },
        position: "after",
      },
    ],
  });

  await graph.hatTokenMap.addDecorations();

  if (multiplePhrases) {
    // If test is simulating separate phrases, we simulate pre-phrase signal being sent
    prePhraseVersion = "version3";
  }

  await vscode.commands.executeCommand("cursorless.command", {
    version: 1,
    spokenForm: "whatever",
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
    usePrePhraseSnapshot,
  });

  assert.deepStrictEqual(
    editor.selections.map(selectionToPlainObject),
    expectedSelections.map(selectionToPlainObject)
  );
}
