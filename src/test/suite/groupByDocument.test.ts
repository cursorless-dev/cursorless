import * as assert from "assert";
import * as vscode from "vscode";
import HatTokenMap from "../../core/HatTokenMap";
import { getCursorlessApi } from "../../util/getExtensionApi";
import { standardSuiteSetup } from "./standardSuiteSetup";

suite("Group by document", async function () {
  standardSuiteSetup(this);

  test("Group by document", runTest);
});

async function runTest() {
  const graph = (await getCursorlessApi()).graph!;

  await vscode.commands.executeCommand("workbench.action.closeAllEditors");

  const document = await vscode.workspace.openTextDocument({
    language: "plaintext",
    content: "hello world",
  });

  const editor1 = await vscode.window.showTextDocument(document);
  const editor2 = await vscode.window.showTextDocument(
    document,
    vscode.ViewColumn.Beside,
  );

  await graph.hatTokenMap.addDecorations();
  const hatMap = await graph.hatTokenMap.getReadableMap(false);

  const hat1 = hatMap
    .getEntries()
    .find(([, token]) => token.editor === editor1 && token.text === "hello");
  const hat2 = hatMap
    .getEntries()
    .find(([, token]) => token.editor === editor2 && token.text === "world");

  const { hatStyle: hatStyle1, character: char1 } = HatTokenMap.splitKey(
    hat1![0],
  );
  const { hatStyle: hatStyle2, character: char2 } = HatTokenMap.splitKey(
    hat2![0],
  );

  await vscode.commands.executeCommand(
    "cursorless.command",
    "swap each with whale",
    "swapTargets",
    [
      {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: hatStyle1,
          character: char1,
        },
      },
      {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: hatStyle2,
          character: char2,
        },
      },
    ],
  );

  assert.deepStrictEqual(document.getText(), "world hello");
}
