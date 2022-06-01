import * as assert from "assert";
import { promises as fsp } from "fs";
import * as yaml from "js-yaml";
import * as sinon from "sinon";
import * as vscode from "vscode";
import HatTokenMap from "../../core/HatTokenMap";
import { ReadOnlyHatMap } from "../../core/IndividualHatMap";
import { extractTargetedMarks } from "../../testUtil/extractTargetedMarks";
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
import sleep from "../../util/sleep";
import { openNewEditor } from "../openNewEditor";
import asyncSafety from "../util/asyncSafety";
import { getRecordedTestPaths } from "../util/getFixturePaths";
import { runSingleTest } from "./runSingleRecordedTest";

function createPosition(position: PositionPlainObject) {
  return new vscode.Position(position.line, position.character);
}

function createSelection(selection: SelectionPlainObject): vscode.Selection {
  const active = createPosition(selection.active);
  const anchor = createPosition(selection.anchor);
  return new vscode.Selection(anchor, active);
}

suite("recorded test cases", async function () {
  this.timeout("100s");
  this.retries(runSingleTest() ? 0 : 5);

  teardown(() => {
    sinon.restore();
  });

  suiteSetup(async () => {
    // Necessary because opening a notebook opens the panel for some reason
    await vscode.commands.executeCommand("workbench.action.closePanel");
  });

  getRecordedTestPaths().forEach((path) =>
    test(
      path.split(".")[0],
      asyncSafety(() => runTest(path))
    )
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
    fixture.languageId
  );

  if (fixture.postEditorOpenSleepTimeMs != null) {
    await sleep(fixture.postEditorOpenSleepTimeMs);
  }

  if (!fixture.initialState.documentContents.includes("\n")) {
    await editor.edit((editBuilder) => {
      editBuilder.setEndOfLine(vscode.EndOfLine.LF);
    });
  }

  editor.selections = fixture.initialState.selections.map(createSelection);

  if (fixture.initialState.thatMark) {
    const initialThatMark = fixture.initialState.thatMark.map((mark) => ({
      selection: createSelection(mark),
      editor,
    }));
    cursorlessApi.thatMark.set(initialThatMark);
  }
  if (fixture.initialState.sourceMark) {
    const initialSourceMark = fixture.initialState.sourceMark.map((mark) => ({
      selection: createSelection(mark),
      editor,
    }));
    cursorlessApi.sourceMark.set(initialSourceMark);
  }

  if (fixture.initialState.clipboard) {
    Clipboard.writeText(fixture.initialState.clipboard);
    // FIXME https://github.com/cursorless-dev/cursorless/issues/559
    // let mockClipboard = fixture.initialState.clipboard;
    // sinon.replace(Clipboard, "readText", async () => mockClipboard);
    // sinon.replace(Clipboard, "writeText", async (value: string) => {
    //   mockClipboard = value;
    // });
  } else {
    excludeFields.push("clipboard");
  }

  await graph.hatTokenMap.addDecorations();

  const readableHatMap = await graph.hatTokenMap.getReadableMap(
    usePrePhraseSnapshot
  );

  // Assert that recorded decorations are present
  checkMarks(fixture.initialState.marks, readableHatMap);

  const returnValue = await vscode.commands.executeCommand(
    "cursorless.command",
    { ...fixture.command, usePrePhraseSnapshot }
  );

  const marks =
    fixture.finalState.marks == null
      ? undefined
      : marksToPlainObject(
          extractTargetedMarks(
            Object.keys(fixture.finalState.marks) as string[],
            readableHatMap
          )
        );

  // TODO Visible ranges are not asserted, see:
  // https://github.com/cursorless-dev/cursorless/issues/160
  const { visibleRanges, ...resultState } = await takeSnapshot(
    cursorlessApi.thatMark,
    cursorlessApi.sourceMark,
    excludeFields,
    [],
    marks
  );

  if (process.env.CURSORLESS_TEST_UPDATE_FIXTURES === "true") {
    const outputFixture = { ...fixture, finalState: resultState, returnValue };
    await fsp.writeFile(file, serialize(outputFixture));
  } else {
    assert.deepStrictEqual(
      resultState,
      fixture.finalState,
      "Unexpected final state"
    );

    if (fixture.decorations != null) {
      assert.deepStrictEqual(
        testDecorationsToPlainObject(graph.editStyles.testDecorations),
        fixture.decorations,
        "Unexpected decorations"
      );
    }

    assert.deepStrictEqual(
      returnValue,
      fixture.returnValue,
      "Unexpected return value"
    );
  }
}

function checkMarks(
  marks: SerializedMarks | undefined,
  hatTokenMap: ReadOnlyHatMap
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
