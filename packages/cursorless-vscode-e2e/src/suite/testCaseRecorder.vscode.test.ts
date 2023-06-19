import {
  ActionType,
  getFixturePath,
  getRecordedTestsDirPath,
  HatTokenMap,
} from "@cursorless/common";
import {
  getCursorlessApi,
  openNewEditor,
  runCursorlessCommand,
} from "@cursorless/vscode-common";
import { assert } from "chai";
import * as crypto from "crypto";
import { mkdir, readdir, readFile, rm } from "fs/promises";
import * as path from "path";
import * as os from "os";
import { basename } from "path";
import * as vscode from "vscode";
import { endToEndTestSetup } from "../endToEndTestSetup";

// Ensure that the test case recorder works
suite("testCaseRecorder", async function () {
  endToEndTestSetup(this);

  test("no args", testCaseRecorderNoArgs);
  test("path arg", testCaseRecorderPathArg);
  test("graceful error", testCaseRecorderGracefulError);
});

async function testCaseRecorderNoArgs() {
  const {
    hatTokenMap,
    ide: { fakeIde },
  } = (await getCursorlessApi()).testHelpers!;
  const dirName = crypto.randomBytes(16).toString("hex");
  fakeIde.setQuickPickReturnValue(dirName);
  const tmpdir = path.join(getRecordedTestsDirPath(), dirName);

  try {
    await runAndCheckTestCaseRecorder(hatTokenMap, tmpdir);
  } finally {
    fakeIde.setQuickPickReturnValue(undefined);
    await rm(tmpdir, { recursive: true, force: true });
  }
}

async function testCaseRecorderPathArg() {
  const { hatTokenMap } = (await getCursorlessApi()).testHelpers!;
  const tmpdir = path.join(os.tmpdir(), crypto.randomBytes(16).toString("hex"));
  await mkdir(tmpdir, { recursive: true });

  try {
    await runAndCheckTestCaseRecorder(hatTokenMap, tmpdir, {
      directory: tmpdir,
    });
  } finally {
    await rm(tmpdir, { recursive: true, force: true });
  }
}

async function testCaseRecorderGracefulError() {
  const { hatTokenMap } = (await getCursorlessApi()).testHelpers!;
  const tmpdir = path.join(os.tmpdir(), crypto.randomBytes(16).toString("hex"));
  await mkdir(tmpdir, { recursive: true });

  try {
    await startRecording({
      directory: tmpdir,
    });

    try {
      await runCursorlessCommand({
        version: 5,
        action: { name: "badActionName" as ActionType },
        targets: [
          {
            type: "primitive",
            mark: {
              type: "cursor",
            },
          },
        ],
        usePrePhraseSnapshot: false,
        spokenForm: "bad command",
      });
    } catch (err) {
      // Ignore error
    }

    await initalizeEditor(hatTokenMap);
    await takeHarp();
    await stopRecording();
    await checkRecordedTest(tmpdir);
  } finally {
    await rm(tmpdir, { recursive: true, force: true });
  }
}

async function runAndCheckTestCaseRecorder(
  hatTokenMap: HatTokenMap,
  tmpdir: string,
  ...extraArgs: unknown[]
) {
  await initalizeEditor(hatTokenMap);
  await startRecording(...extraArgs);
  await takeHarp();
  await stopRecording();
  await checkRecordedTest(tmpdir);
}

async function initalizeEditor(hatTokenMap: HatTokenMap) {
  const editor = await openNewEditor("hello world");

  editor.selections = [new vscode.Selection(0, 11, 0, 11)];

  await hatTokenMap.allocateHats();
}

async function startRecording(...extraArgs: unknown[]) {
  await vscode.commands.executeCommand(
    "cursorless.recordTestCase",
    ...extraArgs,
  );
}

async function stopRecording() {
  await vscode.commands.executeCommand("cursorless.recordTestCase");
}

async function takeHarp() {
  await runCursorlessCommand({
    version: 4,
    action: { name: "setSelection" },
    targets: [
      {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character: "h",
        },
      },
    ],
    usePrePhraseSnapshot: false,
    spokenForm: "take harp",
  });
}

async function checkRecordedTest(tmpdir: string) {
  const paths = await readdir(tmpdir);
  assert.lengthOf(paths, 1);

  const actualRecordedTestPath = paths[0];
  assert.equal(basename(actualRecordedTestPath), "takeHarp.yml");

  const expected = (
    await readFile(
      getFixturePath("recorded/testCaseRecorder/takeHarp.yml"),
      "utf8",
    )
  )
    // We use this to ensure that the test works on Windows. Depending on user
    // / CI git config, the file might be checked out with CRLF line endings
    .replaceAll("\r\n", "\n");
  const actualRecordedTest = await readFile(
    path.join(tmpdir, actualRecordedTestPath),
    "utf8",
  );

  assert.equal(actualRecordedTest, expected);
}
