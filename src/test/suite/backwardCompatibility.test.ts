import * as assert from "assert";
import * as vscode from "vscode";
import { cursorlessCommandId } from "../../common/commandIds";
import { getCursorlessApi } from "../../util/getExtensionApi";
import { openNewEditor } from "../openNewEditor";
import { standardSuiteSetup } from "./standardSuiteSetup";

suite("Backward compatibility", async function () {
  standardSuiteSetup(this);

  test("Backward compatibility", runTest);
});

async function runTest() {
  const graph = (await getCursorlessApi()).graph!;

  const editor = await openNewEditor("");

  editor.selections = [new vscode.Selection(0, 0, 0, 0)];

  await graph.hatTokenMap.addDecorations();

  await vscode.commands.executeCommand(
    cursorlessCommandId,
    "whatever",
    "wrapWithPairedDelimiter",
    [{ type: "primitive", selectionType: "line", mark: { type: "cursor" } }],
    "(",
    ")",
  );

  assert.deepStrictEqual(editor.document.getText(), "()");
}
