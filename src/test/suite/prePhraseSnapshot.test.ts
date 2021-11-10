import * as assert from "assert";
import * as vscode from "vscode";
import * as sinon from "sinon";
import { getCursorlessApi } from "../../util/getExtensionApi";
import { selectionToPlainObject } from "../../testUtil/toPlainObject";
import { mockPrePhraseGetVersion } from "../mockPrePhraseGetVersion";

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
  const initialContent = "Hello world testing whatever";

  const graph = (await getCursorlessApi()).graph!;

  await vscode.commands.executeCommand("workbench.action.closeAllEditors");
  const document = await vscode.workspace.openTextDocument({
    language: "plaintext",
    content: initialContent,
  });
  const editor = await vscode.window.showTextDocument(document);

  editor.selections = [new vscode.Selection(0, 0, 0, 0)];

  await graph.hatTokenMap.addDecorations();

  let prePhraseVersion = "version";

  mockPrePhraseGetVersion(graph, async () => prePhraseVersion);

  await vscode.commands.executeCommand(
    "cursorless.command",
    "whatever",
    "replaceWithTarget",
    [
      { type: "primitive", selectionType: "line", mark: { type: "cursor" } },
      {
        type: "primitive",
        mark: { type: "cursor" },
        position: "after",
      },
    ]
  );

  await graph.hatTokenMap.addDecorations();

  if (multiplePhrases) {
    // If test is simulating separate phrases, we simulate pre-phrase signal being sent
    prePhraseVersion = "version2";
  }

  await vscode.commands.executeCommand(
    "cursorless.command",
    "whatever",
    "setSelection",
    [
      {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character: "o",
          usePrePhraseSnapshot,
        },
      },
    ]
  );

  assert.deepStrictEqual(
    editor.selections.map(selectionToPlainObject),
    expectedSelections.map(selectionToPlainObject)
  );
}
