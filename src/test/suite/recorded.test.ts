import * as assert from "assert";
import { promises as fsp } from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import * as vscode from "vscode";
import { isMatch } from "lodash";
import { TestCaseFixture } from "../../TestCase";
import { SymbolColor } from "../../constants";
import { ThatMark } from "../../ThatMark";
import NavigationMap from "../../NavigationMap";
import * as sinon from "sinon";
import { Clipboard } from "../../Clipboard";
import { takeSnapshot } from "../../takeSnapshot";
import { PositionPlainObject, SelectionPlainObject } from "../../toPlainObject";

function createPosition(position: PositionPlainObject) {
  return new vscode.Position(position.line, position.character);
}

function createSelection(selection: SelectionPlainObject): vscode.Selection {
  const active = createPosition(selection.active);
  const anchor = createPosition(selection.anchor);
  return new vscode.Selection(anchor, active);
}

suite("recorded test cases", async function () {
  const directory = path.join(__dirname, "../../../testFixtures");
  const files = await fsp.readdir(directory);

  teardown(() => {
    sinon.restore();
  });

  files.forEach(async (file) => {
    test(file.split(".")[0], async function () {
      this.timeout(100000);
      const cursorless = vscode.extensions.getExtension("pokey.cursorless");

      if (cursorless == null) {
        throw new Error("Could not get cursorless extension");
      }

      const cursorlessApi: {
        thatMark: ThatMark;
        navigationMap: NavigationMap;
      } = await cursorless.activate();
      const buffer = await fsp.readFile(path.join(directory, file));
      const fixture = yaml.load(buffer.toString()) as TestCaseFixture;

      await vscode.commands.executeCommand("workbench.action.closeAllEditors");
      const document = await vscode.workspace.openTextDocument({
        language: fixture.languageId,
        content: fixture.initialState.documentContents,
      });
      const editor = await vscode.window.showTextDocument(document);
      editor.selections = fixture.initialState.selections.map(createSelection);

      if (fixture.initialState.thatMark) {
        const initialThatMark = fixture.initialState.thatMark.map((mark) => ({
          selection: createSelection(mark),
          editor,
        }));
        cursorlessApi.thatMark.set(initialThatMark);
      }

      if (fixture.initialState.clipboard) {
        let mockClipboard = fixture.initialState.clipboard;
        sinon.replace(Clipboard, "readText", async () => mockClipboard);
        sinon.replace(Clipboard, "writeText", async (value: string) => {
          mockClipboard = value;
        });
      }

      // Wait for cursorless to set up decorations
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Assert that recorded decorations are present
      Object.entries(fixture.marks).forEach(([key, token]) => {
        const { color, character } = NavigationMap.splitKey(key);
        const currentToken = cursorlessApi.navigationMap.getToken(
          color,
          character
        );
        assert(currentToken != null, `Mark "${color} ${character}" not found`);
        const tokensMatch =
          currentToken.range.start === token.start &&
          currentToken.range.end === token.end;
        assert(tokensMatch, `Token for "${color} ${character}" does not match`);
      });

      const returnValue = await vscode.commands.executeCommand(
        "cursorless.command",
        fixture.command.actionName,
        fixture.command.partialTargets,
        ...fixture.command.extraArgs
      );

      // Do not assert visible ranges; for now they are included as context
      const { visibleRanges, ...resultState } = await takeSnapshot(
        cursorlessApi.thatMark
      );

      assert(
        isMatch(resultState, fixture.finalState),
        "Unexpected final state"
      );
      assert.deepStrictEqual(fixture.returnValue, returnValue);
    });
  });
});
