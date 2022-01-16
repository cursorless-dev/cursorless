import * as assert from "assert";
import * as vscode from "vscode";
import * as sinon from "sinon";
import { getCursorlessApi } from "../../util/getExtensionApi";

suite("Group by document", async function () {
  this.timeout("100s");
  this.retries(3);

  teardown(() => {
    sinon.restore();
  });

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
    vscode.ViewColumn.Beside
  );

  await graph.hatTokenMap.addDecorations();
  const hatMap = await graph.hatTokenMap.getReadableMap(false);

  const hat1 = hatMap
    .getEntries()
    .find(([, token]) => token.editor === editor1 && token.text === "hello");
  const hat2 = hatMap
    .getEntries()
    .find(([, token]) => token.editor === editor2 && token.text === "world");

  const [color1, char1] = hat1![0].split(".");
  const [color2, char2] = hat2![0].split(".");

  await vscode.commands.executeCommand(
    "cursorless.command",
    "swap each with whale",
    "swapTargets",
    [
      {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: color1,
          character: char1,
        },
      },
      {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: color2,
          character: char2,
        },
      },
    ],
    "(",
    ")"
  );

  assert.deepStrictEqual(document.getText(), "world hello");
}
