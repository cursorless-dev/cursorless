import {
  Command,
  CommandResponse,
  EditableTextEditor,
  ExcludableSnapshotField,
  ExtraSnapshotField,
  FakeCommandServerApi,
  Fallback,
  HatTokenMap,
  IDE,
  Position,
  PositionPlainObject,
  ReadOnlyHatMap,
  Selection,
  SelectionPlainObject,
  SerializedMarks,
  SpyIDE,
  TargetPlainObject,
  TestCaseFixtureLegacy,
  TestCaseSnapshot,
  TextEditor,
  TokenHat,
  clientSupportsFallback,
  extractTargetedMarks,
  marksToPlainObject,
  omitByDeep,
  plainObjectToRange,
  rangeToPlainObject,
  serializeTestFixture,
  shouldUpdateFixtures,
  splitKey,
  spyIDERecordedValuesToPlainObject,
  storedTargetKeys,
} from "@cursorless/common";
import { assert } from "chai";
import * as yaml from "js-yaml";
import { isUndefined } from "lodash";
import { promises as fsp } from "node:fs";

function createPosition(position: PositionPlainObject) {
  return new Position(position.line, position.character);
}

function createSelection(selection: SelectionPlainObject): Selection {
  const active = createPosition(selection.active);
  const anchor = createPosition(selection.anchor);
  return new Selection(anchor, active);
}

export interface TestHelpers {
  hatTokenMap: HatTokenMap;

  // FIXME: Remove this once we have a better way to get this function
  // accessible from our tests
  takeSnapshot(
    excludeFields: ExcludableSnapshotField[],
    extraFields: ExtraSnapshotField[],
    editor: TextEditor,
    ide: IDE,
    marks: SerializedMarks | undefined,
  ): Promise<TestCaseSnapshot>;

  setStoredTarget(
    editor: TextEditor,
    key: string,
    targets: TargetPlainObject[] | undefined,
  ): void;

  commandServerApi: FakeCommandServerApi;
}

interface RunRecordedTestOpts {
  /**
   * The path to the test fixture
   */
  path: string;

  /**
   * The spy IDE
   */
  spyIde: SpyIDE;

  /**
   * Open a new editor to use for running a recorded test
   *
   * @param content The content of the new editor
   * @param languageId The language id of the new editor
   * @returns A text editor
   */
  openNewTestEditor: (
    content: string,
    languageId: string,
  ) => Promise<TextEditor>;

  /**
   * Sleep for a certain number of milliseconds, exponentially
   * increasing the sleep time each time we re-run the test
   *
   * @param ms The base sleep time
   * @returns A promise that resolves after sleeping
   */
  sleepWithBackoff: (ms: number) => Promise<void>;

  /**
   * Test helper functions returned by the Cursorless extension
   */
  testHelpers: TestHelpers;

  /**
   * Run a cursorless command using the ide's command mechanism
   * @param command The Cursorless command to run
   * @returns The result of the command
   */
  runCursorlessCommand: (
    command: Command,
  ) => Promise<CommandResponse | unknown>;
}

export async function runRecordedTest({
  path,
  spyIde,
  openNewTestEditor,
  sleepWithBackoff,
  testHelpers,
  runCursorlessCommand,
}: RunRecordedTestOpts) {
  const buffer = await fsp.readFile(path);
  const fixture = yaml.load(buffer.toString()) as TestCaseFixtureLegacy;
  const excludeFields: ExcludableSnapshotField[] = [];

  // FIXME The snapshot gets messed up with timing issues when running the recorded tests
  // "Couldn't find token default.a"
  const usePrePhraseSnapshot = false;

  const { hatTokenMap, takeSnapshot, setStoredTarget, commandServerApi } =
    testHelpers;

  const editor = (await openNewTestEditor(
    fixture.initialState.documentContents,
    fixture.languageId,
  )) as EditableTextEditor;

  if (fixture.postEditorOpenSleepTimeMs != null) {
    await sleepWithBackoff(fixture.postEditorOpenSleepTimeMs);
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

  commandServerApi.setFocusedElementType(fixture.focusedElementType);

  // Ensure that the expected hats are present
  await hatTokenMap.allocateHats(
    getTokenHats(fixture.initialState.marks, spyIde.activeTextEditor!),
  );

  const readableHatMap = await hatTokenMap.getReadableMap(usePrePhraseSnapshot);

  // Assert that recorded decorations are present
  checkMarks(fixture.initialState.marks, readableHatMap);

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

      await fsp.writeFile(path, serializeTestFixture(outputFixture));
    } else if (fixture.thrownError != null) {
      assert.strictEqual(
        error.name,
        fixture.thrownError.name,
        "Unexpected thrown error",
      );
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
            Object.keys(fixture.finalState.marks),
            readableHatMap,
          ),
        );

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

    await fsp.writeFile(path, serializeTestFixture(outputFixture));
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
