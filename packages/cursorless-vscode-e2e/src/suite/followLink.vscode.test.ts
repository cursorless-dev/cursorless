import { openNewEditor } from "@cursorless/vscode-common";
import * as assert from "assert";
import * as os from "os";
import * as vscode from "vscode";
import { endToEndTestSetup, sleepWithBackoff } from "../endToEndTestSetup";
import { runCursorlessCommand } from "@cursorless/vscode-common";
import { getFixturePath } from "@cursorless/common";

suite("followLink", async function () {
  endToEndTestSetup(this);

  test("follow definition", followDefinition);
  test("follow link", followLink);
});

async function followDefinition() {
  const editor = await openNewEditor("const foo = 'hello';\nconst bar = foo;", {
    languageId: "typescript",
  });
  await vscode.commands.executeCommand("revealLine", {
    lineNumber: 1,
    at: "top",
  });
  editor.selections = [new vscode.Selection(1, 12, 1, 15)];

  await sleepWithBackoff(50);

  assert.equal(editor.visibleRanges[0].start.line, 1);

  await runCursorlessCommand({
    version: 1,
    action: "followLink",
    targets: [
      {
        type: "primitive",
        mark: {
          type: "cursor",
        },
      },
    ],
  });

  await sleepWithBackoff(50);

  assert.equal(editor.visibleRanges[0].start.line, 0);
}

async function followLink() {
  const filename = getFixturePath("helloWorld.txt");
  const linkTextContent =
    os.platform() === "win32" ? `file:///${filename}` : `file://${filename}`;
  await openNewEditor(linkTextContent);

  await runCursorlessCommand({
    version: 1,
    action: "followLink",
    targets: [
      {
        type: "primitive",
        mark: {
          type: "cursor",
        },
      },
    ],
  });

  // eslint-disable-next-line no-restricted-properties
  const editor = vscode.window.activeTextEditor;
  assert.equal(editor?.document?.uri?.scheme, "file");
  assert.equal(editor?.document.getText().trimEnd(), "hello world");
}
