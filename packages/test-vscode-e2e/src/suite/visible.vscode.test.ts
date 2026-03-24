import { LATEST_VERSION } from "@cursorless/lib-common";
import {
  getReusableEditor,
  runCursorlessCommand,
} from "@cursorless/lib-vscode-common";
import * as assert from "node:assert/strict";
import * as vscode from "vscode";
import { endToEndTestSetup } from "../endToEndTestSetup";

suite("visible", async function () {
  endToEndTestSetup(this);

  test("visible multiple regions", testMultipleRegions);
});

async function testMultipleRegions() {
  const editor = await getReusableEditor(content, "typescript");

  await foldRegion();

  assert.equal(editor.visibleRanges.length, 2);

  await clearVisible();

  assert.equal(editor.selections.length, 2);

  assert.equal(editor.document.getText(), "\n    // 2\n");
}

const content = `
// 1

function myFunk() {
    // 2
}

// 3
`;

function foldRegion() {
  return vscode.commands.executeCommand("editor.fold", {
    levels: 1,
    direction: "down",
    selectionLines: [3],
  });
}

function clearVisible() {
  return runCursorlessCommand({
    version: LATEST_VERSION,
    usePrePhraseSnapshot: false,
    action: {
      name: "clearAndSetSelection",
      target: {
        type: "primitive",
        mark: {
          type: "cursor",
        },
        modifiers: [{ type: "visible" }],
      },
    },
  });
}
