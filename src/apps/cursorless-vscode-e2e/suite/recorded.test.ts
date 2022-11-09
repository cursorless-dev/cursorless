import {
  getCursorlessApi,
  marksToPlainObject,
  PositionPlainObject,
  rangeToPlainObject,
  SelectionPlainObject,
  SerializedMarks,
  testDecorationsToPlainObject,
  DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST,
  ExcludableSnapshotField,
  takeSnapshot,
} from "@cursorless/vscode-common";
import {
  serialize,
  splitKey,
  extractTargetedMarks,
  FakeIDE,
} from "@cursorless/common";
import { assert } from "chai";
import { promises as fsp } from "fs";
import * as yaml from "js-yaml";
import * as vscode from "vscode";
import type { ReadOnlyHatMap } from "../../../core/IndividualHatMap";
import type { SpyIDE } from "@cursorless/common";
import type { TestCaseFixture } from "../../../testUtil/TestCaseFixture";
import asyncSafety from "../asyncSafety";
import { getFixturePath, getRecordedTestPaths } from "../getFixturePaths";
import { openNewEditor } from "../openNewEditor";
import { runCursorlessCommand } from "../runCommand";
import shouldUpdateFixtures from "../shouldUpdateFixtures";
import { sleepWithBackoff, endToEndTestSetup } from "../endToEndTestSetup";

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
    const { ide: fake } = (await getCursorlessApi()).testHelpers!;
    setupFake(fake!);
  });

  getRecordedTestPaths().forEach((path) =>
    test(
      path.split(".")[0],
      asyncSafety(() => runTest(path, getSpy()!)),
    ),
  );
});

async function runTest(file: string, spyIde: SpyIDE) {
  const buffer = await fsp.readFile(file);
  const fixture = yaml.load(buffer.toString()) as TestCaseFixture;
  const excludeFields: ExcludableSnapshotField[] = [];

  // TODO The snapshot gets messed up with timing issues when running the recorded tests
  // "Couldn't find token default.a"
  const usePrePhraseSnapshot = false;

  const cursorlessApi = await getCursorlessApi();
  const { graph, plainObjectToTarget } = cursorlessApi.testHelpers!;

  graph.editStyles.testDecorations = [];

  const editor = await openNewEditor(
    fixture.initialState.documentContents,
    fixture.languageId,
  );

  // Override any user settings and make sure tests run with default tabs.
  editor.options = DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST;

  if (fixture.postEditorOpenSleepTimeMs != null) {
    await sleepWithBackoff(fixture.postEditorOpenSleepTimeMs);
  }

  editor.selections = fixture.initialState.selections.map(createSelection);

  if (fixture.initialState.thatMark) {
    const initialThatTargets = fixture.initialState.thatMark.map((mark) =>
      plainObjectToTarget(editor, mark),
    );
    cursorlessApi.thatMark.set(initialThatTargets);
  }

  if (fixture.initialState.sourceMark) {
    const initialSourceTargets = fixture.initialState.sourceMark.map((mark) =>
      plainObjectToTarget(editor, mark),
    );
    cursorlessApi.sourceMark.set(initialSourceTargets);
  }

  if (fixture.initialState.clipboard) {
    vscode.env.clipboard.writeText(fixture.initialState.clipboard);
    // FIXME https://github.com/cursorless-dev/cursorless/issues/559
    // spyIde.clipboard.writeText(fixture.initialState.clipboard);
  }

  await graph.hatTokenMap.addDecorations();

  const readableHatMap = await graph.hatTokenMap.getReadableMap(
    usePrePhraseSnapshot,
  );

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

      await fsp.writeFile(file, serialize(outputFixture));
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

  // TODO Visible ranges are not asserted, see:
  // https://github.com/cursorless-dev/cursorless/issues/160
  const { visibleRanges, ...resultState } = await takeSnapshot(
    cursorlessApi.thatMark,
    cursorlessApi.sourceMark,
    excludeFields,
    [],
    vscode.window.activeTextEditor!, // eslint-disable-line no-restricted-properties
    spyIde,
    marks,
    undefined,
    undefined,
    // FIXME: Stop overriding the clipboard once we have #559
    vscode.env.clipboard,
  );

  const actualDecorations =
    fixture.decorations == null
      ? undefined
      : testDecorationsToPlainObject(graph.editStyles.testDecorations);

  const actualSpyIdeValues = spyIde.getSpyValues();

  if (shouldUpdateFixtures()) {
    const outputFixture = {
      ...fixture,
      finalState: resultState,
      decorations: actualDecorations,
      returnValue,
      ide: actualSpyIdeValues,
      thrownError: undefined,
    };

    await fsp.writeFile(file, serialize(outputFixture));
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
      actualDecorations,
      fixture.decorations,
      "Unexpected decorations",
    );

    assert.deepStrictEqual(
      returnValue,
      fixture.returnValue,
      "Unexpected return value",
    );

    assert.deepStrictEqual(
      actualSpyIdeValues,
      fixture.ide,
      "Unexpected ide captured values",
    );
  }
}

function setupFake(fakeIde: FakeIDE) {
  fakeIde.configuration.mockConfigurationScope(
    { languageId: "css" },
    { wordSeparators: ["_", "-"] },
    true,
  );
  fakeIde.configuration.mockConfigurationScope(
    { languageId: "scss" },
    { wordSeparators: ["_", "-"] },
    true,
  );
  fakeIde.configuration.mockConfigurationScope(
    { languageId: "shellscript" },
    { wordSeparators: ["_", "-"] },
    true,
  );
  fakeIde.configuration.mockConfiguration("experimental", {
    snippetsDir: getFixturePath("cursorless-snippets"),
  });
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
