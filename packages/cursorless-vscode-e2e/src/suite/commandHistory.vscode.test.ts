import { LATEST_VERSION } from "@cursorless/common";
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

suite("commandHistory", async function () {
  endToEndTestSetup(this);

  const tmpdir = (await getCursorlessApi()).testHelpers!
    .cursorlessCommandHistoryDirPath;

  test("commandHistory: active", () => testActive(tmpdir));
  test("commandHistory: inactive", () => testInactive(tmpdir));
  test("commandHistory: error", () => testError(tmpdir));
});

async function testActive(tmpdir: string) {
  await injectFakeIsActive(true);
  await initalizeEditor();
  await takeCommand("h");

  try {
    assert.ok(existsSync(tmpdir));
    const paths = await readdir(tmpdir);
    assert.lengthOf(paths, 1);
    assert.ok(/cursorlessCommandHistory_.*\.jsonl/.test(paths[0]));
  } finally {
    await afterEach(tmpdir);
  }
}

async function testInactive(tmpdir: string) {
  await injectFakeIsActive(false);
  await initalizeEditor();
  await takeCommand("h");

  try {
    assert.notOk(existsSync(tmpdir));
  } finally {
    await afterEach(tmpdir);
  }
}

async function testError(tmpdir: string) {
  await injectFakeIsActive(true);
  await initalizeEditor();

  try {
    await takeCommand("a");
  } catch (error) {
    // Do nothing
  }

  try {
    assert.ok(existsSync(tmpdir));
    const paths = await readdir(tmpdir);
    assert.lengthOf(paths, 1);
    assert.ok(/cursorlessCommandHistory_.*\.jsonl/.test(paths[0]));
    const content = await readFile(path.join(tmpdir, paths[0]), "utf8");
    assert.ok(content.includes('"thrownError":'));
  } finally {
    await afterEach(tmpdir);
  }
}

async function afterEach(tmpdir: string) {
  await rm(tmpdir, { recursive: true, force: true });
  sinon.restore();
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

async function takeCommand(character: string) {
  await runCursorlessCommand({
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
  });
}
