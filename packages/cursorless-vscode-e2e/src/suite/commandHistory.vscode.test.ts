import {
  CommandComplete,
  CommandHistoryEntry,
  LATEST_VERSION,
  ReplaceActionDescriptor,
} from "@cursorless/common";
import {
  getCursorlessApi,
  openNewEditor,
  runCursorlessCommand,
} from "@cursorless/vscode-common";
import { assert } from "chai";
import { existsSync } from "node:fs";
import { readFile, readdir, rm } from "node:fs/promises";
import path from "node:path";
import * as vscode from "vscode";
import { endToEndTestSetup } from "../endToEndTestSetup";
import { produce } from "immer";

/*
 * All tests in this file are running against the latest version of the command
 * and needs to be manually updated on every command migration.
 */

suite("commandHistory", function () {
  endToEndTestSetup(this);

  let tmpdir = "";

  suiteSetup(async () => {
    tmpdir = (await getCursorlessApi()).testHelpers!
      .cursorlessCommandHistoryDirPath;
  });

  this.afterEach(async () => {
    await rm(tmpdir, { recursive: true, force: true });
  });

  test("active", () => testActive(tmpdir));
  test("sanitization", () => testSanitization(tmpdir));
  test("inactive", () => testInactive(tmpdir));
  test("error", () => testError(tmpdir));
});

async function testActive(tmpdir: string) {
  await injectFakeIsActive(true);
  await initalizeEditor();
  const command = takeCommand("e");
  await runCursorlessCommand(command);

  const content = await getLogEntry(tmpdir);
  delete command.spokenForm;
  assert.deepEqual(content.command, command);
}

async function testSanitization(tmpdir: string) {
  await injectFakeIsActive(true);
  await initalizeEditor();
  const command = replaceWithTextCommand();
  await runCursorlessCommand(command);

  const content = await getLogEntry(tmpdir);
  assert.deepEqual(
    content.command,
    produce(command, (draft) => {
      (draft.action as ReplaceActionDescriptor).replaceWith = [];
    }),
  );
}

async function testInactive(tmpdir: string) {
  await injectFakeIsActive(false);
  await initalizeEditor();
  await runCursorlessCommand(takeCommand("e"));

  assert.notOk(existsSync(tmpdir));
}

async function testError(tmpdir: string) {
  await injectFakeIsActive(true);
  await initalizeEditor();
  const command = takeCommand("a");

  try {
    await runCursorlessCommand(command);
  } catch (error) {
    // Do nothing
  }

  const content = await getLogEntry(tmpdir);
  assert.containsAllKeys(content, ["error"]);
  delete command.spokenForm;
  assert.deepEqual(content.command, command);
}

async function getLogEntry(tmpdir: string) {
  assert.ok(existsSync(tmpdir));
  const paths = await readdir(tmpdir);
  assert.lengthOf(paths, 1);
  assert.ok(/cursorlessCommandHistory_.*\.jsonl/.test(paths[0]));

  return JSON.parse(
    await readFile(path.join(tmpdir, paths[0]), "utf8"),
  ) as CommandHistoryEntry;
}

async function injectFakeIsActive(isActive: boolean): Promise<void> {
  (await getCursorlessApi()).testHelpers!.ide.configuration.mockConfiguration(
    "commandHistory",
    isActive,
  );
}

async function initalizeEditor() {
  const { hatTokenMap } = (await getCursorlessApi()).testHelpers!;

  const editor = await openNewEditor("hello world");

  editor.selections = [new vscode.Selection(0, 11, 0, 11)];

  await hatTokenMap.allocateHats();
}

function takeCommand(character: string): CommandComplete {
  return {
    version: LATEST_VERSION,
    spokenForm: `take <${character}>`,
    usePrePhraseSnapshot: false,
    action: {
      name: "setSelection",
      target: {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character,
        },
      },
    },
  };
}

function replaceWithTextCommand(): CommandComplete {
  return {
    version: LATEST_VERSION,
    usePrePhraseSnapshot: false,
    action: {
      name: "replace",
      destination: {
        type: "implicit",
      },
      replaceWith: ["hello world"],
    },
  };
}
