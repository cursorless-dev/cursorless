import { CURSORLESS_COMMAND_ID } from "@cursorless/common";
import { getCursorlessApi } from "@cursorless/vscode-common";
import * as assert from "assert";
import * as vscode from "vscode";
import { openNewEditor } from "../openNewEditor";
import { endToEndTestSetup } from "../endToEndTestSetup";

suite("Backward compatibility", async function () {
  endToEndTestSetup(this);

  test("Backward compatibility", runTest);
});

async function runTest() {
  const graph = (await getCursorlessApi()).graph!;

  const editor = await openNewEditor("");

  editor.selections = [new vscode.Selection(0, 0, 0, 0)];

  await graph.hatTokenMap.addDecorations();

  await vscode.commands.executeCommand(
    CURSORLESS_COMMAND_ID,
    "whatever",
    "wrapWithPairedDelimiter",
    [{ type: "primitive", selectionType: "line", mark: { type: "cursor" } }],
    "(",
    ")",
  );

  assert.deepStrictEqual(editor.document.getText(), "()");
}
