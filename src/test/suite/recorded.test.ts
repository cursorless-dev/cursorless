import * as assert from "assert";
import { promises as fsp } from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import * as vscode from "vscode";
import NavigationMap from "../../NavigationMap";
import TestCase, {
  SerializedPosition,
  SerializedRange,
  SerializedSelection,
  TestCaseFixture,
} from "../../TestCase";
import { Token } from "../../Types";

function deserializePosition(position: SerializedPosition) {
  return new vscode.Position(position.line, position.character);
}

function deserializeRange(range: SerializedRange) {
  return new vscode.Range(
    deserializePosition(range.start),
    deserializePosition(range.end)
  );
}

function deserializeSelection(
  selection: SerializedSelection
): vscode.Selection {
  const active = deserializePosition(selection.active);
  const anchor = deserializePosition(selection.anchor);
  return new vscode.Selection(anchor, active);
}

suite("recorded test cases", async function () {
  const directory = path.join(
    __dirname,
    // TODO What's the best way to handle this?
    "../../../src/test/suite/recordings"
  );
  const files = await fsp.readdir(directory);

  files.forEach(async (file) => {
    test(file.split(".")[0], async function () {
      this.timeout(100000);
      const buffer = await fsp.readFile(path.join(directory, file));
      const fixture = yaml.load(buffer.toString()) as TestCaseFixture;

      await vscode.commands.executeCommand("workbench.action.closeAllEditors");
      const document = await vscode.workspace.openTextDocument({
        language: fixture.languageId,
        content: fixture.initialState.document,
      });
      const editor = await vscode.window.showTextDocument(document);

      await vscode.env.clipboard.writeText(fixture.initialState.clipboard);
      editor.selections =
        fixture.initialState.selections.map(deserializeSelection);

      // TODO restore visible ranges?
      // Not sure of a straightforward way to do this. Maybe just use to test folding?

      const navigationMap = new NavigationMap();
      Object.entries(fixture.decorations).forEach(([key, value], index) => {
        const range = deserializeRange(value);
        const text = editor.document.getText(range);
        // TODO not a big fan of this, need a better way to create tokens
        const token: Token = {
          text,
          range,
          startOffset: editor.document.offsetAt(range.start) + index,
          endOffset: editor.document.offsetAt(range.end) + index + text.length,
          displayLine: value.start.line, // TODO depends on visible ranges? See above
          editor: vscode.window.activeTextEditor!,
        };
        const [color, character] = key.split(".");
        // @ts-ignore TODO should probably add a decoration color type?
        navigationMap.addToken(color, character, token);
      });

      await vscode.commands.executeCommand(
        "cursorless.setNavigationMap",
        navigationMap
      );

      await vscode.commands.executeCommand(
        "cursorless.command",
        fixture.command.actionName,
        fixture.command.partialTargets,
        ...fixture.command.extraArgs
      );

      assert.deepStrictEqual(fixture.finalState, await TestCase.getSnapshot());
    });
  });
});
