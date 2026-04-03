import assert from "node:assert/strict";
import * as vscode from "vscode";
import type { HatTokenMap } from "@cursorless/lib-common";
import {
  getReusableEditor,
  getTestHelpers,
} from "@cursorless/lib-vscode-common";
import { endToEndTestSetup } from "../endToEndTestSetup";

suite("toggle decorations", function () {
  endToEndTestSetup(this);

  test("toggle decorations", () => runTest());
});

async function runTest() {
  const { hatTokenMap } = await getTestHelpers();

  await getReusableEditor("Hello world testing whatever");

  // Check that hats appear by default
  await hatTokenMap.allocateHats();
  assert.ok((await getNumEntries(hatTokenMap)) > 0);

  // Check that hats disappear when turned off
  await vscode.commands.executeCommand("cursorless.toggleDecorations");
  await hatTokenMap.allocateHats();
  assert.ok((await getNumEntries(hatTokenMap)) === 0);

  // Check that hats reappear when turned back on
  await vscode.commands.executeCommand("cursorless.toggleDecorations");
  await hatTokenMap.allocateHats();
  assert.ok((await getNumEntries(hatTokenMap)) > 0);

  // Check that hats disappear when turned off
  await vscode.commands.executeCommand("cursorless.toggleDecorations", false);
  await hatTokenMap.allocateHats();
  assert.ok((await getNumEntries(hatTokenMap)) === 0);

  // Check that hats reappear when turned back on
  await vscode.commands.executeCommand("cursorless.toggleDecorations", true);
  await hatTokenMap.allocateHats();
  assert.ok((await getNumEntries(hatTokenMap)) > 0);
}

async function getNumEntries(hatTokenMap: HatTokenMap): Promise<number> {
  const map = await hatTokenMap.getReadableMap(false);
  return map.getEntries().length;
}
