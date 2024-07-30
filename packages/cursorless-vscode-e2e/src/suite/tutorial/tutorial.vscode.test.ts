import {
  LATEST_VERSION,
  SpyIDE,
  TestCaseFixtureLegacy,
  asyncSafety,
  getSnapshotForComparison,
  sleep,
} from "@cursorless/common";
import { getRecordedTestsDirPath, loadFixture } from "@cursorless/node-common";
import {
  getCursorlessApi,
  runCursorlessCommand,
} from "@cursorless/vscode-common";
import assert from "node:assert";
import path from "path";
import sinon from "sinon";
import { commands } from "vscode";
import { endToEndTestSetup, sleepWithBackoff } from "../../endToEndTestSetup";
import { isEqual } from "lodash-es";

suite("tutorial", async function () {
  const { getSpy } = endToEndTestSetup(this);

  test(
    "basic",
    asyncSafety(() => runBasicTutorialTest(getSpy()!)),
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
    assert.deepStrictEqual(
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

  // Allow for debounce
  await sleep(100);

  // Another sleep just in case
  await sleepWithBackoff(50);

  // We allow duplicate messages because they're idempotent. Not sure why some
  // platforms get the init message twice but it doesn't matter.
  const result = getTutorialWebviewEventLog();
  // This is the initial message that the webview sends to the extension.
  // Seeing this means that the javascript in the webview successfully loaded.
  assert(
    result.some((e) =>
      isEqual(e, {
        type: "messageReceived",
        data: {
          type: "getInitialState",
        },
      }),
    ),
  );

  // This is the response from the extension to the webview's initial message.
  assert(
    result.some((e) =>
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
    ),
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

  // Allow for debounce
  await sleep(100);

  // Another sleep just in case
  await sleepWithBackoff(50);

  assert(
    getTutorialWebviewEventLog().some(
      (message) =>
        message.type === "messageSent" &&
        message.data.preConditionsMet === false,
    ),
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
  assert.deepStrictEqual(getTutorialWebviewEventLog().slice(-2), [
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
