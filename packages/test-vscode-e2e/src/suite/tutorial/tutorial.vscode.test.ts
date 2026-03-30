import assert from "node:assert/strict";
import path from "node:path";
import { isEqual } from "lodash-es";
import * as sinon from "sinon";
import { commands } from "vscode";
import type { SpyIDE, TestCaseFixtureLegacy } from "@cursorless/lib-common";
import {
  LATEST_VERSION,
  asyncSafety,
  getSnapshotForComparison,
} from "@cursorless/lib-common";
import {
  getRecordedTestsDirPath,
  loadFixture,
} from "@cursorless/lib-node-common";
import {
  getCursorlessApi,
  runCursorlessCommand,
  type SpyWebViewEvent,
} from "@cursorless/lib-vscode-common";
import { endToEndTestSetup } from "../../endToEndTestSetup";
import { waitFor } from "../waitFor";

suite("tutorial", async function () {
  const { getSpy } = endToEndTestSetup(this);

  test(
    "basic",
    asyncSafety(() => runBasicTutorialTest(getSpy())),
  );
});

const BASICS_TUTORIAL_ID = "tutorial-1-basics";

async function runBasicTutorialTest(spyIde: SpyIDE) {
  const cursorlessApi = await getCursorlessApi();
  const { hatTokenMap, takeSnapshot, getTutorialWebviewEventLog, vscodeApi } =
    cursorlessApi.testHelpers!;
  const commandsRun: string[] = [];
  sinon.replace(
    vscodeApi.commands,
    "executeCommand",
    <T>(command: string, ...args: any[]): Thenable<T> => {
      commandsRun.push(command);
      return commands.executeCommand(command, ...args);
    },
  );
  const tutorialDirectory = path.join(
    getRecordedTestsDirPath(),
    "tutorial",
    BASICS_TUTORIAL_ID,
  );

  const fixtures = await Promise.all(
    ["takeCap.yml", "takeBlueSun.yml", "takeHarpPastDrum.yml"].map((name) =>
      loadFixture(path.join(tutorialDirectory, name)),
    ),
  );

  const checkStepSetup = async (fixture: TestCaseFixtureLegacy) => {
    assert.deepEqual(
      await getSnapshotForComparison(
        fixture.initialState,
        await hatTokenMap.getReadableMap(false),
        spyIde,
        takeSnapshot,
      ),
      fixture.initialState,
      "Unexpected final state",
    );
  };

  // Test starting tutorial
  await commands.executeCommand(
    "cursorless.tutorial.start",
    BASICS_TUTORIAL_ID,
  );
  await checkStepSetup(fixtures[0]);

  // We allow duplicate messages because they're idempotent. Not sure why some
  // platforms get the init message twice but it doesn't matter.

  // This is the initial message that the webview sends to the extension.
  // Seeing this means that the javascript in the webview successfully loaded.
  await waitForEvent(
    getTutorialWebviewEventLog,
    (e) => e.type === "messageReceived" && e.data.type === "getInitialState",
  );

  // This is the response from the extension to the webview's initial message.
  await waitForEvent(getTutorialWebviewEventLog, (e) =>
    isEqual(e, {
      type: "messageSent",
      data: {
        type: "doingTutorial",
        hasErrors: false,
        id: "tutorial-1-basics",
        stepNumber: 0,
        stepContent: [
          [
            {
              type: "string",
              value: "Say ",
            },
            {
              type: "command",
              value: "take cap",
            },
          ],
        ],
        stepCount: 11,
        title: "Introduction",
        preConditionsMet: true,
      },
    }),
  );

  // Check that we focus the tutorial webview when the user starts the tutorial
  // FIXME: Find a way to make this still work if the test is retried
  // assert(commandsRun.includes("cursorless.tutorial.focus"));

  // Check that it doesn't auto-advance for incorrect command
  await runNoOpCursorlessCommand();
  await checkStepSetup(fixtures[0]);

  // Test that we detect when prerequisites are no longer met
  // "chuck file"
  await runCursorlessCommand({
    version: LATEST_VERSION,
    action: {
      name: "remove",
      target: {
        type: "primitive",
        modifiers: [
          { type: "containingScope", scopeType: { type: "document" } },
        ],
      },
    },
    usePrePhraseSnapshot: false,
  });

  await waitForEvent(
    getTutorialWebviewEventLog,
    (event) =>
      event.type === "messageSent" && event.data.preConditionsMet === false,
  );

  // Test resuming tutorial
  await commands.executeCommand("cursorless.tutorial.resume");
  await checkStepSetup(fixtures[0]);

  // Test automatic advancing
  await runCursorlessCommand({
    ...fixtures[0].command,
    usePrePhraseSnapshot: false,
  });
  await checkStepSetup(fixtures[1]);

  // Test restarting tutorial
  await commands.executeCommand("cursorless.tutorial.restart");
  await checkStepSetup(fixtures[0]);

  // Test manual advancing
  await commands.executeCommand("cursorless.tutorial.next");
  await commands.executeCommand("cursorless.tutorial.next");
  await checkStepSetup(fixtures[2]);

  // Test manual retreating
  await commands.executeCommand("cursorless.tutorial.previous");
  await checkStepSetup(fixtures[1]);

  // Test listing tutorials
  await commands.executeCommand("cursorless.tutorial.list");
  assert.deepEqual(getTutorialWebviewEventLog().slice(-2), [
    {
      type: "messageSent",
      data: {
        type: "pickingTutorial",
        tutorials: [
          {
            id: "tutorial-1-basics",
            title: "Introduction",
            version: 0,
            stepCount: 11,
            currentStep: 1,
          },
          {
            id: "tutorial-2-basic-coding",
            title: "Basic coding",
            version: 0,
            stepCount: 11,
            currentStep: 0,
          },
        ],
      },
    },
    { type: "viewShown", preserveFocus: true },
  ]);
}

// This is a cursorless command that does nothing. It's useful for testing
// that the tutorial doesn't auto-advance when the user does something that
// isn't part of the tutorial.
const runNoOpCursorlessCommand = () =>
  runCursorlessCommand({
    version: LATEST_VERSION,
    action: {
      name: "setSelection",
      target: {
        type: "primitive",
        mark: {
          type: "cursor",
        },
        modifiers: [{ type: "toRawSelection" }],
      },
    },
    usePrePhraseSnapshot: false,
  });

async function waitForEvent(
  getTutorialWebviewEventLog: () => SpyWebViewEvent[],
  predicate: (event: SpyWebViewEvent) => boolean,
) {
  const success = await waitFor(() =>
    getTutorialWebviewEventLog().some(predicate),
  );
  if (!success) {
    assert.fail("Timed out waiting for tutorial event log");
  }
}
