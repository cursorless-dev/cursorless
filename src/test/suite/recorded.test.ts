import * as assert from "assert";
import serialize from "../../testUtil/serialize";
import { promises as fsp } from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import * as vscode from "vscode";
import { TestCaseFixture } from "../../testUtil/TestCase";
import NavigationMap from "../../core/NavigationMap";
import * as sinon from "sinon";
import { Clipboard } from "../../util/Clipboard";
import { takeSnapshot } from "../../testUtil/takeSnapshot";
import {
  marksToPlainObject,
  PositionPlainObject,
  rangeToPlainObject,
  SelectionPlainObject,
  SerializedMarks,
} from "../../testUtil/toPlainObject";
import { walkFilesSync } from "../../testUtil/walkSync";
import {
  CursorlessApi,
  getCursorlessApi,
  getParseTreeApi,
} from "../../util/getExtensionApi";
import { enableDebugLog } from "../../util/debug";
import { extractTargetedMarks } from "../../testUtil/extractTargetedMarks";

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
  this.retries(3);
  const directory = path.join(
    __dirname,
    "../../../src/test/suite/fixtures/recorded"
  );
  const files = walkFilesSync(directory);
  enableDebugLog(false);

  teardown(() => {
    sinon.restore();
  });

  files.forEach((file) => test(file.split(".")[0], () => runTest(file)));
});

async function runTest(file: string) {
  const buffer = await fsp.readFile(file);
  const fixture = yaml.load(buffer.toString()) as TestCaseFixture;
  const excludeFields: string[] = [];

  const cursorlessApi = await getCursorlessApi();
  const parseTreeApi = await getParseTreeApi();

  await vscode.commands.executeCommand("workbench.action.closeAllEditors");
  const document = await vscode.workspace.openTextDocument({
    language: fixture.languageId,
    content: fixture.initialState.documentContents,
  });
  const editor = await vscode.window.showTextDocument(document);

  if (!fixture.initialState.documentContents.includes("\n")) {
    await editor.edit((editBuilder) => {
      editBuilder.setEndOfLine(vscode.EndOfLine.LF);
    });
  }

  await parseTreeApi.loadLanguage(document.languageId);

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
    let mockClipboard = fixture.initialState.clipboard;
    sinon.replace(Clipboard, "readText", async () => mockClipboard);
    sinon.replace(Clipboard, "writeText", async (value: string) => {
      mockClipboard = value;
    });
  } else {
    excludeFields.push("clipboard");
  }

  // Wait for cursorless to set up decorations
  cursorlessApi.addDecorations();

  // Assert that recorded decorations are present
  checkMarks(fixture.initialState.marks, cursorlessApi.navigationMap);

  const returnValue = await vscode.commands.executeCommand(
    "cursorless.command",
    fixture.spokenForm,
    fixture.command.actionName,
    fixture.command.partialTargets,
    ...fixture.command.extraArgs
  );

  const marks =
    fixture.finalState.marks == null
      ? undefined
      : marksToPlainObject(
          extractTargetedMarks(
            Object.keys(fixture.finalState.marks) as string[],
            cursorlessApi.navigationMap
          )
        );

  // TODO Visible ranges are not asserted, see:
  // https://github.com/pokey/cursorless-vscode/issues/160
  const { visibleRanges, ...resultState } = await takeSnapshot(
    cursorlessApi.thatMark,
    cursorlessApi.sourceMark,
    excludeFields,
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
  navigationMap: NavigationMap
) {
  if (marks == null) {
    return;
  }

  Object.entries(marks).forEach(([key, token]) => {
    const { hatStyle, character } = NavigationMap.splitKey(key);
    const currentToken = navigationMap.getToken(hatStyle, character);
    assert(currentToken != null, `Mark "${hatStyle} ${character}" not found`);
    assert.deepStrictEqual(rangeToPlainObject(currentToken.range), token);
  });
}
