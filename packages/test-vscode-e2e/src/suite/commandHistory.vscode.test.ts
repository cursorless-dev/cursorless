import * as assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile, readdir, rm } from "node:fs/promises";
import * as path from "node:path";
import { produce } from "immer";
import * as vscode from "vscode";
import type {
  CommandComplete,
  CommandHistoryEntry,
  ReplaceActionDescriptor,
} from "@cursorless/lib-common";
import { LATEST_VERSION } from "@cursorless/lib-common";
import {
  getTestHelpers,
  openNewEditor,
  runCursorlessCommand,
} from "@cursorless/lib-vscode-common";
import { endToEndTestSetup } from "../endToEndTestSetup";

/*
 * All tests in this file are running against the latest version of the command
 * and needs to be manually updated on every command migration.
 */

suite("commandHistory", function () {
  endToEndTestSetup(this);

  let tmpdir = "";

  suiteSetup(async () => {
    const { cursorlessCommandHistoryDirPath } = await getTestHelpers();
    tmpdir = cursorlessCommandHistoryDirPath;
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

  assert.ok(!existsSync(tmpdir));
}

async function testError(tmpdir: string) {
  await injectFakeIsActive(true);
  await initalizeEditor();
  const command = takeCommand("a");

  try {
    await runCursorlessCommand(command);
  } catch {
    // Do nothing
  }

  const content = await getLogEntry(tmpdir);
  assert.ok("error" in content);
  delete command.spokenForm;
  assert.deepEqual(content.command, command);
}

async function getLogEntry(tmpdir: string) {
  assert.ok(existsSync(tmpdir));
  const paths = await readdir(tmpdir);
  assert.equal(paths.length, 1);
  assert.ok(/cursorlessCommandHistory_.*\.jsonl/u.test(paths[0]));

  return JSON.parse(
    await readFile(path.join(tmpdir, paths[0]), "utf8"),
  ) as CommandHistoryEntry;
}

async function injectFakeIsActive(isActive: boolean): Promise<void> {
  const { ide } = await getTestHelpers();
  ide.configuration.mockConfiguration("commandHistory", isActive);
}

async function initalizeEditor() {
  const { hatTokenMap } = await getTestHelpers();

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
