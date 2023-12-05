import * as assert from "assert";
import * as vscode from "vscode";
import { openNewEditor } from "@cursorless/vscode-common";
import { endToEndTestSetup } from "../endToEndTestSetup";
import { runCursorlessCommand } from "@cursorless/vscode-common";

suite("visible", async function () {
  endToEndTestSetup(this);

  test("visible single region", testSingleRegion);
  test("visible multiple regions", testMultipleRegions);
});

async function testSingleRegion() {
  const editor = await openEditor();

  await clearVisible();

  assert.equal(editor.document.getText(), "");
}

async function testMultipleRegions() {
  const editor = await openEditor();

  await foldRegion();

  assert.equal(editor.visibleRanges.length, 2);

  await clearVisible();

  assert.equal(editor.selections.length, 2);

  assert.equal(editor.document.getText(), "\n\t// 2\n");
}

function openEditor() {
  return openNewEditor("// 1\n\nfunction myFunk() {\n\t// 2\n}\n\n// 3", {
    languageId: "typescript",
  });
}

function foldRegion() {
  return vscode.commands.executeCommand("editor.fold", {
    levels: 1,
    direction: "down",
    selectionLines: [2],
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
