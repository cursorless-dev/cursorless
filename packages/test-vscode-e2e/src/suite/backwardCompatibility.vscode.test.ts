import { CURSORLESS_COMMAND_ID } from "@cursorless/lib-common";
import {
  getCursorlessApi,
  getReusableEditor,
} from "@cursorless/lib-vscode-common";
import * as assert from "node:assert/strict";
import * as vscode from "vscode";
import { endToEndTestSetup } from "../endToEndTestSetup";

suite("Backward compatibility", async function () {
  endToEndTestSetup(this);

  test("Backward compatibility", runTest);
});

async function runTest() {
  const { hatTokenMap } = (await getCursorlessApi()).testHelpers!;

  const editor = await getReusableEditor("");

  editor.selections = [new vscode.Selection(0, 0, 0, 0)];

  await hatTokenMap.allocateHats();

  await vscode.commands.executeCommand(
    CURSORLESS_COMMAND_ID,
    "whatever",
    "wrapWithPairedDelimiter",
    [{ type: "primitive", selectionType: "line", mark: { type: "cursor" } }],
    "(",
    ")",
  );

  assert.equal(editor.document.getText(), "()");
}
