import * as assert from "assert";
import { promises as fsp } from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import * as vscode from "vscode";
import { TestCaseFixture } from "../../TestCase";
import { ThatMark } from "../../ThatMark";
import NavigationMap from "../../NavigationMap";
import * as sinon from "sinon";
import { Clipboard } from "../../Clipboard";
import { takeSnapshot } from "../../takeSnapshot";
import {
  PositionPlainObject,
  rangeToPlainObject,
  SelectionPlainObject,
} from "../../toPlainObject";
import { walkFilesSync } from "./walkSync";
import { enableDebugLog } from "../../debug";

function createPosition(position: PositionPlainObject) {
  return new vscode.Position(position.line, position.character);
}

function createSelection(selection: SelectionPlainObject): vscode.Selection {
  const active = createPosition(selection.active);
  const anchor = createPosition(selection.anchor);
  return new vscode.Selection(anchor, active);
}

suite("recorded test cases", async function () {
  const directory = path.join(
    __dirname,
    "../../../src/test/suite/fixtures/recorded"
  );
  const files = walkFilesSync(directory);
  enableDebugLog(false);

  teardown(() => {
    sinon.restore();
  });

  let lastLanguageId: string;

  files.forEach(async (file) => {
    test(file.split(".")[0], async function () {
      this.timeout(100000);
      const cursorless = vscode.extensions.getExtension("pokey.cursorless");

      if (cursorless == null) {
        throw new Error("Could not get cursorless extension");
      }

      const cursorlessApi: {
        thatMark: ThatMark;
        sourceMark: ThatMark;
        navigationMap: NavigationMap;
        addDecorations: () => void;
      } = await cursorless.activate();
      const buffer = await fsp.readFile(file);
      const fixture = yaml.load(buffer.toString()) as TestCaseFixture;
      const excludeFields: string[] = [];

      await vscode.commands.executeCommand("workbench.action.closeAllEditors");
      const document = await vscode.workspace.openTextDocument({
        language: fixture.languageId,
        content: fixture.initialState.documentContents,
      });
      const editor = await vscode.window.showTextDocument(document);

      // Sleep on changing language is necessary otherwise the tree sitter
      // will throw an exception on getNodeAtLocation()
      if (lastLanguageId !== document.languageId) {
        if (lastLanguageId != null) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
        lastLanguageId = document.languageId;
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
        const initialSourceMark = fixture.initialState.sourceMark.map(
          (mark) => ({
            selection: createSelection(mark),
            editor,
          })
        );
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
      const assertDecorations = () => {
        Object.entries(fixture.marks).forEach(([key, token]) => {
          const { color, character } = NavigationMap.splitKey(key);
          const currentToken = cursorlessApi.navigationMap.getToken(
            color,
            character
          );
          assert(
            currentToken != null,
            `Mark "${color} ${character}" not found`
          );
          assert.deepStrictEqual(rangeToPlainObject(currentToken.range), token);
        });
      };

      // Tried three times, sleep 100ms between each
      await tryAndRetry(assertDecorations, 3, 100);

      const returnValue = await vscode.commands.executeCommand(
        "cursorless.command",
        fixture.spokenForm,
        fixture.command.actionName,
        fixture.command.partialTargets,
        ...fixture.command.extraArgs
      );

      // TODO Visible ranges are not asserted, see:
      // https://github.com/pokey/cursorless-vscode/issues/160
      const { visibleRanges, ...resultState } = await takeSnapshot(
        cursorlessApi.thatMark,
        cursorlessApi.sourceMark,
        excludeFields
      );

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
    });
  });
});

async function tryAndRetry(
  callback: () => void,
  numberOfThries: number,
  sleepTime: number
) {
  while (true) {
    try {
      return callback();
    } catch (error) {
      if (numberOfThries === 0) {
        throw error;
      }
      numberOfThries--;
      await new Promise((resolve) => setTimeout(resolve, sleepTime));
    }
  }
}
