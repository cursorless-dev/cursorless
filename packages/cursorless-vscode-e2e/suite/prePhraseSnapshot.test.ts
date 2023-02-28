import { HatStability, selectionToPlainObject } from "@cursorless/common";
import {
  fromVscodeSelection,
  getCursorlessApi,
  openNewEditor,
  runCursorlessCommand,
} from "@cursorless/vscode-common";
import * as assert from "assert";
import * as vscode from "vscode";
import { endToEndTestSetup } from "../endToEndTestSetup";
import { mockPrePhraseGetVersion } from "../mockPrePhraseGetVersion";
import { setupFake } from "./setupFake";

/**
 * The selections we expect when the pre-phrase snapshot is used
 */
const snapshotExpectedSelections = [new vscode.Selection(0, 0, 0, 1)];

/**
 * The selections we expect when the pre-phrase snapshot is not used
 */
const noSnapshotExpectedSelections = [new vscode.Selection(1, 0, 1, 1)];

suite("Pre-phrase snapshots", async function () {
  endToEndTestSetup(this);

  suiteSetup(async () => {
    const { ide } = (await getCursorlessApi()).testHelpers!;
    setupFake(ide, HatStability.greedy);
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
  expectedSelections: vscode.Selection[],
) {
  const { hatTokenMap, commandServerApi } = (await getCursorlessApi())
    .testHelpers!;

  const editor = await openNewEditor("a\n");

  editor.selections = [new vscode.Selection(1, 0, 1, 0)];

  let prePhraseVersion = "version1";
  mockPrePhraseGetVersion(commandServerApi, async () => prePhraseVersion);

  await hatTokenMap.allocateHats();
  prePhraseVersion = "version2";

  await runCursorlessCommand({
    version: 4,
    spokenForm: "whatever",
    action: {
      name: "replaceWithTarget",
    },
    targets: [
      {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character: "a",
        },
      },
      {
        type: "implicit",
      },
    ],
    usePrePhraseSnapshot: false,
  });

  await hatTokenMap.allocateHats();

  if (multiplePhrases) {
    // If test is simulating separate phrases, we simulate pre-phrase signal being sent
    prePhraseVersion = "version3";
  }

  await runCursorlessCommand({
    version: 1,
    spokenForm: "whatever",
    action: "setSelection",
    targets: [
      {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character: "a",
        },
      },
    ],
    usePrePhraseSnapshot,
  });

  assert.deepStrictEqual(
    editor.selections.map(fromVscodeSelection).map(selectionToPlainObject),
    expectedSelections.map(fromVscodeSelection).map(selectionToPlainObject),
  );
}
