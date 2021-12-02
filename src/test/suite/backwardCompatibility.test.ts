import * as assert from "assert";
import * as vscode from "vscode";
import * as sinon from "sinon";
import { getCursorlessApi } from "../../util/getExtensionApi";
import { openNewEditor } from "../openNewEditor";

suite("Backward compatibility", async function () {
  this.timeout("100s");
  this.retries(3);

  teardown(() => {
    sinon.restore();
  });

  test("Backward compatibility", runTest);
});

async function runTest() {
  const graph = (await getCursorlessApi()).graph!;

  const editor = await openNewEditor("");

  editor.selections = [new vscode.Selection(0, 0, 0, 0)];

  await graph.hatTokenMap.addDecorations();

  await vscode.commands.executeCommand(
    "cursorless.command",
    "whatever",
    "wrapWithPairedDelimiter",
    [{ type: "primitive", selectionType: "line", mark: { type: "cursor" } }],
    "(",
    ")"
  );

  assert.deepStrictEqual(editor.document.getText(), "()");
}
