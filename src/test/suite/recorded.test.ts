import * as assert from "assert";
import serialize from "../../testUtil/serialize";
import { promises as fsp } from "fs";
import * as yaml from "js-yaml";
import * as vscode from "vscode";
import { TestCaseFixture } from "../../testUtil/TestCase";
import HatTokenMap from "../../core/HatTokenMap";
import * as sinon from "sinon";
import { Clipboard } from "../../util/Clipboard";
import {
  ExcludableSnapshotField,
  takeSnapshot,
} from "../../testUtil/takeSnapshot";
import {
  marksToPlainObject,
  PositionPlainObject,
  rangeToPlainObject,
  SelectionPlainObject,
  SerializedMarks,
} from "../../testUtil/toPlainObject";
import { getCursorlessApi } from "../../util/getExtensionApi";
import { extractTargetedMarks } from "../../testUtil/extractTargetedMarks";
import asyncSafety from "../util/asyncSafety";
import { ReadOnlyHatMap } from "../../core/IndividualHatMap";
import { openNewEditor } from "../openNewEditor";
import { getRecordedTestPaths } from "../util/getFixturePaths";

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
  this.retries(5);

  teardown(() => {
    sinon.restore();
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

  const cursorlessApi = await getCursorlessApi();
  const graph = cursorlessApi.graph!;

  const editor = await openNewEditor(
    fixture.initialState.documentContents,
    fixture.languageId
  );

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

  const readableHatMap = await graph.hatTokenMap.getReadableMap(false);

  // Assert that recorded decorations are present
  checkMarks(fixture.initialState.marks, readableHatMap);

  const returnValue = await vscode.commands.executeCommand(
    "cursorless.command",
    fixture.command
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
