import { promises as fsp } from "fs";
import { assert } from "chai";
import * as yaml from "js-yaml";
import * as vscode from "vscode";
import HatTokenMap from "../../core/HatTokenMap";
import { ReadOnlyHatMap } from "../../core/IndividualHatMap";
import { injectSpyIde } from "../../ide/spies/SpyIDE";
import { extractTargetedMarks } from "../../testUtil/extractTargetedMarks";
import { plainObjectToTarget } from "../../testUtil/fromPlainObject";
import serialize from "../../testUtil/serialize";
import {
  ExcludableSnapshotField,
  takeSnapshot,
} from "../../testUtil/takeSnapshot";
import { TestCaseFixture } from "../../testUtil/TestCase";
import {
  marksToPlainObject,
  PositionPlainObject,
  rangeToPlainObject,
  SelectionPlainObject,
  SerializedMarks,
  testDecorationsToPlainObject,
} from "../../testUtil/toPlainObject";
import { Clipboard } from "../../util/Clipboard";
import { getCursorlessApi } from "../../util/getExtensionApi";
import { openNewEditor } from "../openNewEditor";
import asyncSafety from "../util/asyncSafety";
import { getRecordedTestPaths } from "../util/getFixturePaths";
import { injectFakeIde } from "./fakes/ide/FakeIDE";
import shouldUpdateFixtures from "./shouldUpdateFixtures";
import { sleepWithBackoff, standardSuiteSetup } from "./standardSuiteSetup";

function createPosition(position: PositionPlainObject) {
  return new vscode.Position(position.line, position.character);
}

function createSelection(selection: SelectionPlainObject): vscode.Selection {
  const active = createPosition(selection.active);
  const anchor = createPosition(selection.anchor);
  return new vscode.Selection(anchor, active);
}

suite("recorded test cases", async function () {
  standardSuiteSetup(this);

  suiteSetup(async () => {
    // Necessary because opening a notebook opens the panel for some reason
    await vscode.commands.executeCommand("workbench.action.closePanel");
  });

  getRecordedTestPaths().forEach((path) =>
    test(
      path.split(".")[0],
      asyncSafety(() => runTest(path)),
    ),
  );
});

async function runTest(file: string) {
  const buffer = await fsp.readFile(file);
  const fixture = yaml.load(buffer.toString()) as TestCaseFixture;
  const excludeFields: ExcludableSnapshotField[] = [];

  // TODO The snapshot gets messed up with timing issues when running the recorded tests
  // "Couldn't find token default.a"
  const usePrePhraseSnapshot = false;

  const cursorlessApi = await getCursorlessApi();
  const graph = cursorlessApi.graph!;
  graph.editStyles.testDecorations = [];

  const editor = await openNewEditor(
    fixture.initialState.documentContents,
    fixture.languageId,
  );

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
    Clipboard.writeText(fixture.initialState.clipboard);
    // FIXME https://github.com/cursorless-dev/cursorless/issues/559
    // let mockClipboard = fixture.initialState.clipboard;
    // sinon.replace(Clipboard, "readText", async () => mockClipboard);
    // sinon.replace(Clipboard, "writeText", async (value: string) => {
    //   mockClipboard = value;
    // });
  }

  await graph.hatTokenMap.addDecorations();

  const readableHatMap = await graph.hatTokenMap.getReadableMap(
    usePrePhraseSnapshot,
  );

  // Assert that recorded decorations are present
  checkMarks(fixture.initialState.marks, readableHatMap);

  const { dispose: disposeFakeIde } = injectFakeIde(graph);
  const { spy: spyIde } = injectSpyIde(graph);

  let returnValue: unknown;

  try {
    returnValue = await vscode.commands.executeCommand("cursorless.command", {
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

  disposeFakeIde();

  if (fixture.thrownError != null) {
    throw Error(
      `Expected error ${fixture.thrownError.name} but none was thrown`,
    );
  }

  if (fixture.postCommandSleepTimeMs != null) {
    await sleepWithBackoff(fixture.postCommandSleepTimeMs);
  }

  const marks =
    fixture.finalState!.marks == null
      ? undefined
      : marksToPlainObject(
          extractTargetedMarks(
            Object.keys(fixture.finalState!.marks) as string[],
            readableHatMap,
          ),
        );

  if (fixture.finalState!.clipboard == null) {
    excludeFields.push("clipboard");
  }

  if (fixture.finalState!.thatMark == null) {
    excludeFields.push("thatMark");
  }

  if (fixture.finalState!.sourceMark == null) {
    excludeFields.push("sourceMark");
  }

  // TODO Visible ranges are not asserted, see:
  // https://github.com/cursorless-dev/cursorless/issues/160
  const { visibleRanges, ...resultState } = await takeSnapshot(
    cursorlessApi.thatMark,
    cursorlessApi.sourceMark,
    excludeFields,
    [],
    marks,
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

function checkMarks(
  marks: SerializedMarks | undefined,
  hatTokenMap: ReadOnlyHatMap,
) {
  if (marks == null) {
    return;
  }

  Object.entries(marks).forEach(([key, token]) => {
    const { hatStyle, character } = HatTokenMap.splitKey(key);
    const currentToken = hatTokenMap.getToken(hatStyle, character);
    assert(currentToken != null, `Mark "${hatStyle} ${character}" not found`);
    assert.deepStrictEqual(rangeToPlainObject(currentToken.range), token);
  });
}
