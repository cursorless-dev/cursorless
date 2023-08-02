import {
  asyncSafety,
  DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST,
  ExcludableSnapshotField,
  extractTargetedMarks,
  getRecordedTestPaths,
  HatStability,
  marksToPlainObject,
  omitByDeep,
  plainObjectToRange,
  PositionPlainObject,
  rangeToPlainObject,
  ReadOnlyHatMap,
  SelectionPlainObject,
  SerializedMarks,
  serializeTestFixture,
  shouldUpdateFixtures,
  splitKey,
  SpyIDE,
  spyIDERecordedValuesToPlainObject,
  TestCaseFixtureLegacy,
  TextEditor,
  TokenHat,
} from "@cursorless/common";
import {
  getCursorlessApi,
  openNewEditor,
  runCursorlessCommand,
} from "@cursorless/vscode-common";
import { assert } from "chai";
import * as yaml from "js-yaml";
import { promises as fsp } from "node:fs";
import * as vscode from "vscode";
import { endToEndTestSetup, sleepWithBackoff } from "../endToEndTestSetup";
import { setupFake } from "./setupFake";
import { isUndefined } from "lodash";

function createPosition(position: PositionPlainObject) {
  return new vscode.Position(position.line, position.character);
}

function createSelection(selection: SelectionPlainObject): vscode.Selection {
  const active = createPosition(selection.active);
  const anchor = createPosition(selection.anchor);
  return new vscode.Selection(anchor, active);
}

suite("recorded test cases", async function () {
  const { getSpy } = endToEndTestSetup(this);

  suiteSetup(async () => {
    // Necessary because opening a notebook opens the panel for some reason
    await vscode.commands.executeCommand("workbench.action.closePanel");
    const { ide } = (await getCursorlessApi()).testHelpers!;
    setupFake(ide, HatStability.stable);
  });

  getRecordedTestPaths().forEach(({ name, path }) =>
    test(
      name,
      asyncSafety(() => runTest(path, getSpy()!)),
    ),
  );
});

async function runTest(file: string, spyIde: SpyIDE) {
  const buffer = await fsp.readFile(file);
  const fixture = yaml.load(buffer.toString()) as TestCaseFixtureLegacy;
  const excludeFields: ExcludableSnapshotField[] = [];

  // TODO The snapshot gets messed up with timing issues when running the recorded tests
  // "Couldn't find token default.a"
  const usePrePhraseSnapshot = false;

  const cursorlessApi = await getCursorlessApi();
  const { hatTokenMap, takeSnapshot, setStoredTarget } =
    cursorlessApi.testHelpers!;

  const editor = await openNewEditor(fixture.initialState.documentContents, {
    languageId: fixture.languageId,
  });

  // Override any user settings and make sure tests run with default tabs.
  editor.options = DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST;

  if (fixture.postEditorOpenSleepTimeMs != null) {
    await sleepWithBackoff(fixture.postEditorOpenSleepTimeMs);
  }

  editor.selections = fixture.initialState.selections.map(createSelection);

  if (fixture.initialState.thatMark) {
    setStoredTarget(editor, "that", fixture.initialState.thatMark);
  }

  if (fixture.initialState.sourceMark) {
    setStoredTarget(editor, "source", fixture.initialState.sourceMark);
  }

  if (fixture.initialState.instanceReferenceMark) {
    setStoredTarget(
      editor,
      "instanceReference",
      fixture.initialState.instanceReferenceMark,
    );
  }

  if (fixture.initialState.clipboard) {
    vscode.env.clipboard.writeText(fixture.initialState.clipboard);
    // FIXME https://github.com/cursorless-dev/cursorless/issues/559
    // spyIde.clipboard.writeText(fixture.initialState.clipboard);
  }

  // Ensure that the expected hats are present
  await hatTokenMap.allocateHats(
    getTokenHats(fixture.initialState.marks, spyIde.activeTextEditor!),
  );

  const readableHatMap = await hatTokenMap.getReadableMap(usePrePhraseSnapshot);

  // Assert that recorded decorations are present
  checkMarks(fixture.initialState.marks, readableHatMap);

  let returnValue: unknown;

  try {
    returnValue = await runCursorlessCommand({
      ...fixture.command,
      usePrePhraseSnapshot,
    });
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
      assert.strictEqual(error.name, fixture.thrownError.name);
    } else {
      throw error;
    }

    return;
  }

  if (fixture.postCommandSleepTimeMs != null) {
    await sleepWithBackoff(fixture.postCommandSleepTimeMs);
  }

  const marks =
    fixture.finalState?.marks == null
      ? undefined
      : marksToPlainObject(
          extractTargetedMarks(
            Object.keys(fixture.finalState.marks) as string[],
            readableHatMap,
          ),
        );

  if (fixture.finalState?.clipboard == null) {
    excludeFields.push("clipboard");
  }

  if (fixture.finalState?.thatMark == null) {
    excludeFields.push("thatMark");
  }

  if (fixture.finalState?.sourceMark == null) {
    excludeFields.push("sourceMark");
  }

  if (fixture.finalState?.instanceReferenceMark == null) {
    excludeFields.push("instanceReferenceMark");
  }

  // TODO Visible ranges are not asserted, see:
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
      omitByDeep(actualSpyIdeValues, isUndefined),
      fixture.ide,
      "Unexpected ide captured values",
    );
  }
}

function checkMarks(
  marks: SerializedMarks | undefined,
  hatTokenMap: ReadOnlyHatMap,
) {
  if (marks == null) {
    return;
  }

  Object.entries(marks).forEach(([key, token]) => {
    const { hatStyle, character } = splitKey(key);
    const currentToken = hatTokenMap.getToken(hatStyle, character);
    assert(currentToken != null, `Mark "${hatStyle} ${character}" not found`);
    assert.deepStrictEqual(rangeToPlainObject(currentToken.range), token);
  });
}

function getTokenHats(
  marks: SerializedMarks | undefined,
  editor: TextEditor,
): TokenHat[] {
  if (marks == null) {
    return [];
  }

  return Object.entries(marks).map(([key, token]) => {
    const { hatStyle, character } = splitKey(key);
    const range = plainObjectToRange(token);

    return {
      hatStyle,
      grapheme: character,
      token: {
        editor,
        range,
        offsets: {
          start: editor.document.offsetAt(range.start),
          end: editor.document.offsetAt(range.end),
        },
        text: editor.document.getText(range),
      },

      // NB: We don't care about the hat range for this test
      hatRange: range,
    };
  });
}
