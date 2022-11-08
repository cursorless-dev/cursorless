import * as assert from "assert";
import * as os from "os";
import * as vscode from "vscode";
import { runCursorlessCommand } from "../../client-e2e-test/runCommand";
import { getActiveTextEditor } from "../../ide/activeTextEditor";
import { openNewEditor } from "../openNewEditor";
import { getFixturePath } from "../util/getFixturePaths";
import { standardSuiteSetup } from "./standardSuiteSetup";

suite("followLink", async function () {
  standardSuiteSetup(this);

  test("follow definition", followDefinition);
  test("follow link", followLink);
});

async function followDefinition() {
  const editor = await openNewEditor(
    "const foo = 'hello';\nconst bar = foo;",
    "typescript",
  );
  await vscode.commands.executeCommand("revealLine", {
    lineNumber: 1,
    at: "top",
  });
  editor.selections = [new vscode.Selection(1, 12, 1, 15)];

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

  const editor = getActiveTextEditor();
  assert.equal(editor?.document?.uri?.scheme, "file");
  assert.equal(editor?.document.getText().trimEnd(), "hello world");
}
