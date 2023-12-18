import { CommandComplete, LATEST_VERSION } from "@cursorless/common";
import {
  getCursorlessApi,
  openNewEditor,
  runCursorlessCommand,
} from "@cursorless/vscode-common";
import { assert } from "chai";
import { existsSync } from "node:fs";
import { readFile, readdir, rm } from "node:fs/promises";
import path from "node:path";
import sinon from "sinon";
import * as vscode from "vscode";
import { endToEndTestSetup } from "../endToEndTestSetup";

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
    sinon.restore();
  });

  test("active", () => testActive(tmpdir));
  test("inactive", () => testInactive(tmpdir));
  test("error", () => testError(tmpdir));
});

async function testActive(tmpdir: string) {
  await injectFakeIsActive(true);
  await initalizeEditor();
  const command = takeCommand("h");
  await runCursorlessCommand(command);

  assert.ok(existsSync(tmpdir));
  const paths = await readdir(tmpdir);
  assert.lengthOf(paths, 1);
  assert.ok(/cursorlessCommandHistory_.*\.jsonl/.test(paths[0]));
  const content = JSON.parse(
    await readFile(path.join(tmpdir, paths[0]), "utf8"),
  );
  delete command.spokenForm;
  assert.deepEqual(content.command, command);
}

async function testInactive(tmpdir: string) {
  await injectFakeIsActive(false);
  await initalizeEditor();
  await runCursorlessCommand(takeCommand("h"));

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

  assert.ok(existsSync(tmpdir));
  const paths = await readdir(tmpdir);
  assert.lengthOf(paths, 1);
  assert.ok(/cursorlessCommandHistory_.*\.jsonl/.test(paths[0]));
  const content = JSON.parse(
    await readFile(path.join(tmpdir, paths[0]), "utf8"),
  );
  assert.containsAllKeys(content, ["error"]);
  delete command.spokenForm;
  assert.deepEqual(content.command, command);
}

async function injectFakeIsActive(isActive: boolean): Promise<void> {
  const { vscodeApi } = (await getCursorlessApi()).testHelpers!;

  const getConfigurationValue = sinon.fake((sectionName) => {
    if (sectionName === "commandHistory") {
      return isActive;
    }

    return vscode.workspace.getConfiguration("cursorless").get(sectionName);
  });

  sinon.replace(
    vscodeApi.workspace,
    "getConfiguration",
    sinon.fake((section) => {
      if (section === "cursorless") {
        return {
          get: getConfigurationValue,
        } as unknown as vscode.WorkspaceConfiguration;
      }

      return vscode.workspace.getConfiguration(section);
    }),
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
