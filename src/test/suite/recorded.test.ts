import * as assert from "assert";
import { promises as fsp } from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import * as vscode from "vscode";
import * as sinon from "sinon";
import TestCase, {
  SerializedPosition,
  SerializedRange,
  SerializedSelection,
  TestCaseFixture,
} from "../../TestCase";
import * as makeGraphModule from "../../makeGraph";
import graphConstructors from "../../graphConstructors";
import { SymbolColor } from "../../constants";

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
  const directory = path.join(__dirname, "../../../testFixtures");
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
      editor.selections =
        fixture.initialState.selections.map(deserializeSelection);

      // TODO Restore `thatMark` from fixture

      // TODO (Many) unsuccessful mocking attempts
      // TypeError: Cannot assign to read only property 'readText' of object '#<Object>'
      // sinon.replace(
      //   vscode.env.clipboard,
      //   "readText",
      //   async () => fixture.initialState.clipboard
      // );

      // TODO This actually needs to happen before extension activation...
      // Assert that recorded decorations are present
      // const graph = makeGraphModule.makeGraph(graphConstructors);
      // Object.entries(fixture.decorations).forEach(([key, _]) => {
      //   const [color, character] = key.split(".") as [SymbolColor, string];
      //   const token = graph.navigationMap.getToken(color, character);
      //   assert(token != null);
      // });
      // sinon.replace(makeGraphModule, "makeGraph", sinon.fake.returns(graph));

      await new Promise((resolve) => setTimeout(resolve, 1000));

      await vscode.commands.executeCommand(
        "cursorless.command",
        fixture.command.actionName,
        fixture.command.partialTargets,
        ...fixture.command.extraArgs
      );

      assert.deepStrictEqual(fixture.finalState, await TestCase.getSnapshot());
      sinon.restore();
    });
  });
});
