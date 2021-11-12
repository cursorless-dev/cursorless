import * as assert from "assert";
import * as vscode from "vscode";
import * as sinon from "sinon";
import { getCursorlessApi } from "../../util/getExtensionApi";
import { openNewEditor } from "../openNewEditor";

suite("toggle decorations", async function () {
  this.timeout("100s");
  this.retries(3);

  teardown(() => {
    sinon.restore();
  });

  test("toggle decorations", () => runTest());
});

async function runTest() {
  const { hatTokenMap } = (await getCursorlessApi()).graph!;

  await openNewEditor("Hello world testing whatever");

  // Check that hats appear by default
  await hatTokenMap.addDecorations();
  assert((await hatTokenMap.getReadableMap(false)).getEntries().length !== 0);

  // Check that hats disappear when turned off
  await vscode.commands.executeCommand("cursorless.toggleDecorations");
  await hatTokenMap.addDecorations();
  assert((await hatTokenMap.getReadableMap(false)).getEntries().length === 0);

  // Check that hats reappear when turned back on
  await vscode.commands.executeCommand("cursorless.toggleDecorations");
  await hatTokenMap.addDecorations();
  assert((await hatTokenMap.getReadableMap(false)).getEntries().length !== 0);
}
