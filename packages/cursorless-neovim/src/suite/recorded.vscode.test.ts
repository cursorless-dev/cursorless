import {
  // asyncSafety,
  CommandResponse,
  // DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST,
  ExcludableSnapshotField,
  // extractTargetedMarks,
  Fallback,
  // HatStability,
  // marksToPlainObject,
  omitByDeep,
  // plainObjectToRange,
  PositionPlainObject,
  // rangeToPlainObject,
  // ReadOnlyHatMap,
  SelectionPlainObject,
  // SerializedMarks,
  serializeTestFixture,
  shouldUpdateFixtures,
  // splitKey,
  SpyIDE,
  spyIDERecordedValuesToPlainObject,
  storedTargetKeys,
  TestCaseFixtureLegacy,
  // TextEditor,
  // TokenHat,
  clientSupportsFallback,
  // TestCaseSnapshot,
  // ExtraSnapshotField,
  // IDE,
  Selection,
  Position,
  getRecordedTestPaths,
} from "@cursorless/common";
// import {
//   getCursorlessApi,
//   openNewEditor,
//   runCursorlessCommand,
// } from "@cursorless/vscode-common";
import { assert } from "chai";
import * as yaml from "js-yaml";
import { isUndefined } from "lodash";
import { promises as fsp } from "node:fs";
// import * as vscode from "vscode";
import {
  /* endToEndTestSetup, */ sleepWithBackoff,
} from "../endToEndTestSetup";
import { injectIde } from "@cursorless/cursorless-engine";
// import { commandApi } from "../singletons/cmdapi.singleton";
// import { takeSnapshot } from "@cursorless/cursorless-engine";
import { getCursorlessApi } from "../singletons/cursorlessapi.singleton";
import { openNewEditor } from "../testUtil/openNewEditor";
import { runCursorlessCommand } from "../runCommand";
// import { setupFake } from "./setupFake";

function createPosition(position: PositionPlainObject) {
  return new Position(position.line, position.character);
}

function createSelection(selection: SelectionPlainObject): Selection {
  const active = createPosition(selection.active);
  const anchor = createPosition(selection.anchor);
  return new Selection(anchor, active);
}

const failedTests: string[] = [];
const passedTests: string[] = [];
// suite("recorded test cases", async function () {
export async function runRecordedTestCases() {
  // const { getSpy } = endToEndTestSetup(this);

  // suiteSetup(async () => {
  //   // Necessary because opening a notebook opens the panel for some reason
  //   await vscode.commands.executeCommand("workbench.action.closePanel");
  //   const { ide } = (await getCursorlessApi()).testHelpers!;
  //   setupFake(ide, HatStability.stable);
  // });

  //const originalIde = ide();
  // const spyIde = new SpyIDE(originalIde);
  const { ide } = (await getCursorlessApi()).testHelpers!;
  const spyIde = new SpyIDE(ide);
  injectIde(spyIde!);

  // Run all tests
  for (const { name, path } of getRecordedTestPaths()) {
    await runTest(name, path, spyIde!);
  }
  console.warn(`Passed tests: ${passedTests.length}: ${passedTests}`);
  console.warn(`Failed tests: ${failedTests.length}: ${failedTests}`);
  // Run a single test
  // await runTest(
  //   "recorded/selectionTypes/clearRowTwoPastFour",
  //   "C:\\cursorless_fork\\packages\\cursorless-vscode-e2e\\src\\suite\\fixtures\\recorded\\selectionTypes\\clearRowTwoPastFour.yml",
  //   spyIde!,
  // );
  // await runTest(
  //   "recorded/selectionTypes/clearWord2",
  //   "C:\\cursorless_fork\\packages\\cursorless-vscode-e2e\\src\\suite\\fixtures\\recorded\\selectionTypes\\clearWord2.yml",
  //   spyIde!,
  // );
}
async function runTest(name: string, file: string, spyIde: SpyIDE) {
  const buffer = await fsp.readFile(file);
  const fixture = yaml.load(buffer.toString()) as TestCaseFixtureLegacy;
  const excludeFields: ExcludableSnapshotField[] = [];
  // TODO: skip if multiple selections (we don't support multiple cursors atm)
  // We don't support decorated symbol marks yet
  // We don't support parse-tree yet (which requires a code languageId)
  const hasMarks =
    fixture.initialState.marks != null &&
    Object.keys(fixture.initialState.marks).length > 0;
  const hasMultipleSelections =
    fixture.initialState.selections.length > 1 ||
    (fixture.finalState && fixture.finalState.selections.length > 1);
  if (hasMarks || hasMultipleSelections || fixture.languageId !== "plaintext") {
    //console.warn(`runTest(${name}) => skipped`);
    return;
  }
  // Below are tests that should pass but fail for now
  // if (
  //   // name == "recorded/actions/breakJustThis" ||
  //   name == "recorded/actions/breakJustThis2" ||
  //   name == "recorded/actions/changeNextInstanceChar" ||
  //   name == "recorded/actions/cloneToken"
  //   // name === "recorded/ordinalScopes/changeSecondTwoTokens" ||
  //   // name === "recorded/surroundingPair/textual/clearBoundsRound"
  // ) {
  //   console.warn(`runTest(${name}) => skipped as needs fixing`);
  //   return;
  // }
  console.warn(
    "------------------------------------------------------------------------------",
  );
  console.warn(`runTest(${name})...`);

  // FIXME The snapshot gets messed up with timing issues when running the recorded tests
  // "Couldn't find token default.a"
  const usePrePhraseSnapshot = false;

  const cursorlessApi = await getCursorlessApi();
  const {
    hatTokenMap,
    takeSnapshot /* , setStoredTarget */,
    commandServerApi,
  } = cursorlessApi.testHelpers!;

  const editor = await openNewEditor(fixture.initialState.documentContents, {
    languageId: fixture.languageId,
  });

  // Override any user settings and make sure tests run with default tabs.
  //editor.options = DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST;

  if (fixture.postEditorOpenSleepTimeMs != null) {
    await sleepWithBackoff(fixture.postEditorOpenSleepTimeMs);
  }

  await editor.setSelections(
    fixture.initialState.selections.map(createSelection),
  );

  // for (const storedTargetKey of storedTargetKeys) {
  //   const key = `${storedTargetKey}Mark` as const;
  //   setStoredTarget(editor, storedTargetKey, fixture.initialState[key]);
  // }

  // if (fixture.initialState.clipboard) {
  //   vscode.env.clipboard.writeText(fixture.initialState.clipboard);
  //   // FIXME https://github.com/cursorless-dev/cursorless/issues/559
  //   // spyIde.clipboard.writeText(fixture.initialState.clipboard);
  // }

  commandServerApi.setFocusedElementType(
    fixture.focusedElementType === "other"
      ? undefined
      : fixture.focusedElementType ?? "textEditor",
  );

  // NOT NEEDED FROM VSCODE:
  // Ensure that the expected hats are present
  // Assert that recorded decorations are present

  let returnValue: unknown;
  let fallback: Fallback | undefined;

  try {
    returnValue = await runCursorlessCommand({
      ...fixture.command,
      usePrePhraseSnapshot,
    });
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
      try {
        assert.strictEqual(error.name, fixture.thrownError.name);
      } catch (err) {
        console.warn(`runTest(${name}) => wrong thrown error`);
        failedTests.push(name);
        return;
      }
    } else {
      // throw error;
      console.warn(`runTest(${name}) => error: ${error.name}`);
      failedTests.push(name);
      // throw err;
      return;
    }

    return;
  }

  if (fixture.postCommandSleepTimeMs != null) {
    await sleepWithBackoff(fixture.postCommandSleepTimeMs);
  }

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
    // FIXME: Stop overriding the clipboard once we have #559
    true,
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

    try {
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
    } catch (err) {
      console.warn(`runTest(${name}) => failed`);
      failedTests.push(name);
      // throw err;
      return;
    }
    console.warn(`runTest(${name}) => passed`);
    passedTests.push(name);
  }
}
