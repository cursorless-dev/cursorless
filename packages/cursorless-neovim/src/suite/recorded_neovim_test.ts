import {
  CommandResponse,
  ExcludableSnapshotField,
  Fallback,
  Position,
  PositionPlainObject,
  Selection,
  SelectionPlainObject,
  SpyIDE,
  TestCaseFixtureLegacy,
  clientSupportsFallback,
  getRecordedTestPaths,
  omitByDeep,
  serializeTestFixture,
  shouldUpdateFixtures,
  spyIDERecordedValuesToPlainObject,
  storedTargetKeys,
} from "@cursorless/common";
import {
  getCursorlessApi,
  openNewEditor,
  runCursorlessCommand,
} from "@cursorless/neovim-common";
import { assert } from "chai";
import * as yaml from "js-yaml";
import { isUndefined } from "lodash";
import { promises as fsp } from "node:fs";
// import * as vscode from "vscode";
import {
  endToEndTestSetupOld,
  sleepWithBackoffOld,
} from "../endToEndTestSetupOld";
// import { commandApi } from "../singletons/cmdapi.singleton";
// import { takeSnapshot } from "@cursorless/cursorless-engine";
import { AssertionError } from "node:assert";
import { getNeovimIDE } from "../neovimHelpers";
import { neovimClient } from "../singletons/client.singleton";
import { commandApi } from "../singletons/cmdapi.singleton";
// import { setupFake } from "./setupFake";

type errorType = {
  [key: string]: AssertionError;
};

function createPosition(position: PositionPlainObject) {
  return new Position(position.line, position.character);
}

function createSelection(selection: SelectionPlainObject): Selection {
  const active = createPosition(selection.active);
  const anchor = createPosition(selection.anchor);
  return new Selection(anchor, active);
}

const successes: string[] = [];
const failures: errorType = {};

function showFailedTest(name: string, error: AssertionError) {
  console.warn(`Failed test: ${name}`);
  console.warn(`Thrown error: ${error.message}`);
  if (error.expected !== undefined || error.actual !== undefined) {
    const expected = JSON.stringify(error.expected, null, 2);
    const actual = JSON.stringify(error.actual, null, 2);
    console.warn(`Expected: ${expected}`);
    console.warn(`Actual: ${actual}`);
  } else {
    console.warn(`Stack: ${error.stack}`);
  }
}

function showSucceededTest(name: string) {
  console.warn(`Passed test: ${name} \\o/`);
}

// Hiding some failures that we don't know how to fix yet
// @see https://github.com/cursorless-dev/cursorless/issues/2281
const failuresNotShown = ["recorded/marks/chuckNothing"];

function showSummaryTests() {
  console.warn(`Passed tests:\n${successes.join("\n")}`);
  for (const [name, error] of Object.entries(failures)) {
    if (failuresNotShown.includes(name)) {
      continue;
    }
    console.warn("+".repeat(80));
    showFailedTest(name, error);
  }
  const failed = Object.entries(failures).length;
  const total = successes.length + failed;
  console.warn(
    `Passed tests: ${successes.length} / ${total} (failed: ${failed})`,
  );
}

export async function runRecordedTestCases() {
  const { getSpy } = await endToEndTestSetupOld();

  // Run all tests
  const tests = getRecordedTestPaths();

  // Run some tests
  // const fixturePath = getFixturesPath();
  // const tests = [
  //   {
  //     name: "recorded/actions/insertEmptyLines/dropThis",
  //     path: `${fixturePath}/recorded/actions/insertEmptyLines/dropThis.yml`,
  //   },
  // ];

  for (const { name, path } of tests) {
    let executed = true;
    try {
      executed = await runTest(name, path, await getSpy()!);
    } catch (err) {
      const error = err as AssertionError;
      showFailedTest(name, error);
      failures[name] = error;
      continue;
    }
    if (!executed) {
      continue;
    }
    showSucceededTest(name);
    successes.push(name);
  }
  showSummaryTests();
}
async function runTest(
  name: string,
  file: string,
  spyIde: SpyIDE,
): Promise<boolean> {
  const client = neovimClient();
  const neovimIDE = getNeovimIDE();
  const cmdApi = commandApi();

  const buffer = await fsp.readFile(file);
  const fixture = yaml.load(buffer.toString()) as TestCaseFixtureLegacy;
  const excludeFields: ExcludableSnapshotField[] = [];

  // We don't support decorated symbol marks (hats) yet
  const hasMarks =
    fixture.initialState.marks != null &&
    Object.keys(fixture.initialState.marks).length > 0;

  // we don't support multiple selections in neovim (we don't support multiple cursors atm)
  const hasMultipleSelections =
    fixture.initialState.selections.length > 1 ||
    (fixture.finalState && fixture.finalState.selections.length > 1);

  // We don't support Tree sitter yet (which requires a code languageId)
  const needTreeSitter = fixture.languageId !== "plaintext";

  if (hasMarks || hasMultipleSelections || needTreeSitter) {
    return false;
  }

  // Uncomment below for debugging
  // if (name === "recorded/implicitExpansion/chuckBoundingThat") {
  //   console.warn(`runTest(${name}) => let's analyze it`);
  // }

  console.warn(
    "------------------------------------------------------------------------------",
  );
  console.warn(`runTest(${name})...`);

  // FIXME The snapshot gets messed up with timing issues when running the recorded tests
  // "Couldn't find token default.a"
  const usePrePhraseSnapshot = false;

  const { takeSnapshot, setStoredTarget, commandServerApi } = (
    await getCursorlessApi()
  ).testHelpers!;

  const editor = await openNewEditor(
    client,
    neovimIDE,
    fixture.initialState.documentContents,
    {
      languageId: fixture.languageId,
    },
  );

  // Override any user settings and make sure tests run with default tabs.
  //editor.options = DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST;

  if (fixture.postEditorOpenSleepTimeMs != null) {
    await sleepWithBackoffOld(fixture.postEditorOpenSleepTimeMs);
  }

  await editor.setSelections(
    fixture.initialState.selections.map(createSelection),
  );

  for (const storedTargetKey of storedTargetKeys) {
    const key = `${storedTargetKey}Mark` as const;
    setStoredTarget(editor, storedTargetKey, fixture.initialState[key]);
  }

  if (fixture.initialState.clipboard) {
    spyIde.clipboard.writeText(fixture.initialState.clipboard);
  }

  commandServerApi.setFocusedElementType(
    fixture.focusedElementType === "other"
      ? undefined
      : fixture.focusedElementType ?? "textEditor",
  );

  // NOT NEEDED FOR NOW
  // Ensure that the expected hats are present
  // Assert that recorded decorations are present

  let returnValue: unknown;
  let fallback: Fallback | undefined;

  try {
    returnValue = await runCursorlessCommand(
      // client,
      // neovimIDE,
      // cmdApi,
      // commandServerApi,
      {
        ...fixture.command,
        usePrePhraseSnapshot,
      },
    );
    if (clientSupportsFallback(fixture.command)) {
      const commandResponse = returnValue as CommandResponse;
      returnValue =
        "returnValue" in commandResponse
          ? commandResponse.returnValue
          : undefined;
      fallback =
        "fallback" in commandResponse ? commandResponse.fallback : undefined;
    }
  } catch (err) {
    const error = err as Error;

    if (shouldUpdateFixtures()) {
      const outputFixture = {
        ...fixture,
        finalState: undefined,
        decorations: undefined,
        returnValue: undefined,
        thrownError: { name: error.name },
      };

      await fsp.writeFile(file, serializeTestFixture(outputFixture));
    } else if (fixture.thrownError != null) {
      assert.strictEqual(
        error.name,
        fixture.thrownError.name,
        "Unexpected thrown error",
      );
    } else {
      throw error;
    }

    return true;
  }

  if (fixture.postCommandSleepTimeMs != null) {
    await sleepWithBackoffOld(fixture.postCommandSleepTimeMs);
  }

  // We don't support decorated symbol marks (hats) yet
  const marks = undefined;

  if (fixture.finalState?.clipboard == null) {
    excludeFields.push("clipboard");
  }

  for (const storedTargetKey of storedTargetKeys) {
    const key = `${storedTargetKey}Mark` as const;
    if (fixture.finalState?.[key] == null) {
      excludeFields.push(key);
    }
  }

  // FIXME Visible ranges are not asserted, see:
  // https://github.com/cursorless-dev/cursorless/issues/160
  const { visibleRanges, ...resultState } = await takeSnapshot(
    excludeFields,
    [],
    spyIde.activeTextEditor!,
    spyIde,
    marks,
    false,
  );

  const rawSpyIdeValues = spyIde.getSpyValues(fixture.ide?.flashes != null);
  const actualSpyIdeValues =
    rawSpyIdeValues == null
      ? undefined
      : spyIDERecordedValuesToPlainObject(rawSpyIdeValues);

  if (shouldUpdateFixtures()) {
    const outputFixture: TestCaseFixtureLegacy = {
      ...fixture,
      finalState: resultState,
      returnValue,
      fallback,
      ide: actualSpyIdeValues,
      thrownError: undefined,
    };

    await fsp.writeFile(file, serializeTestFixture(outputFixture));
  } else {
    if (fixture.thrownError != null) {
      throw Error(
        `Expected error ${fixture.thrownError.name} but none was thrown`,
      );
    }

    assert.deepStrictEqual(
      resultState,
      fixture.finalState,
      "Unexpected final state",
    );

    assert.deepStrictEqual(
      returnValue,
      fixture.returnValue,
      "Unexpected return value",
    );

    assert.deepStrictEqual(
      fallback,
      fixture.fallback,
      "Unexpected fallback value",
    );

    assert.deepStrictEqual(
      omitByDeep(actualSpyIdeValues, isUndefined),
      fixture.ide,
      "Unexpected ide captured values",
    );
  }
  return true;
}
