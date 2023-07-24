import { getCursorlessApi, openNewEditor } from "@cursorless/vscode-common";
import * as assert from "assert";
import * as vscode from "vscode";
import { endToEndTestSetup } from "../endToEndTestSetup";

suite("toggle decorations", async function () {
  endToEndTestSetup(this);

  test("toggle decorations", () => runTest());
});

async function runTest() {
  const { hatTokenMap } = (await getCursorlessApi()).testHelpers!;

  await openNewEditor("Hello world testing whatever");

  // Check that hats appear by default
  await hatTokenMap.allocateHats();
  assert((await hatTokenMap.getReadableMap(false)).getEntries().length !== 0);

  // Check that hats disappear when turned off
  await vscode.commands.executeCommand("cursorless.toggleDecorations");
  await hatTokenMap.allocateHats();
  assert((await hatTokenMap.getReadableMap(false)).getEntries().length === 0);

  // Check that hats reappear when turned back on
  await vscode.commands.executeCommand("cursorless.toggleDecorations");
  await hatTokenMap.allocateHats();
  assert((await hatTokenMap.getReadableMap(false)).getEntries().length !== 0);
}
