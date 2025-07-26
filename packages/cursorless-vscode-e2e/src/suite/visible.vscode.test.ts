import { openNewEditor, runCursorlessCommand } from "@cursorless/vscode-common";
import * as assert from "node:assert";
import * as vscode from "vscode";
import { endToEndTestSetup } from "../endToEndTestSetup";

suite("visible", async function () {
  endToEndTestSetup(this);

  test("visible multiple regions", testMultipleRegions);
});

async function testMultipleRegions() {
  const editor = await openEditor();

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

function openEditor() {
  return openNewEditor(content, {
    languageId: "typescript",
  });
}

function foldRegion() {
  return vscode.commands.executeCommand("editor.fold", {
    levels: 1,
    direction: "down",
    selectionLines: [3],
  });
}

function clearVisible() {
  return runCursorlessCommand({
    version: 6,
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
