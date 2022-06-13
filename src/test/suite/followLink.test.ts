import * as assert from "assert";
import * as vscode from "vscode";
import * as sinon from "sinon";
import * as os from "os";
import { openNewEditor } from "../openNewEditor";
import { getFixturePath } from "../util/getFixturePaths";

suite("followLink", async function () {
  this.timeout("100s");
  this.retries(3);

  teardown(() => {
    sinon.restore();
  });

  test("follow definition", followDefinition);
  test("follow link", followLink);
});

async function followDefinition() {
  const editor = await openNewEditor(
    "const foo = 'hello';\nconst bar = foo;",
    "typescript"
  );
  await vscode.commands.executeCommand("revealLine", {
    lineNumber: 1,
    at: "top",
  });
  editor.selections = [new vscode.Selection(1, 12, 1, 15)];

  assert.equal(editor.visibleRanges[0].start.line, 1);

  await vscode.commands.executeCommand(
    "cursorless.command",
    "follow this",
    "followLink",
    [
      {
        type: "primitive",
        mark: {
          type: "cursor",
        },
      },
    ]
  );

  assert.equal(editor.visibleRanges[0].start.line, 0);
}

async function followLink() {
  const filename = getFixturePath("helloWorld.txt");
  const linkTextContent =
    os.platform() === "win32" ? `file:///${filename}` : `file://${filename}`;
  await openNewEditor(linkTextContent);

  await vscode.commands.executeCommand(
    "cursorless.command",
    "follow this",
    "followLink",
    [
      {
        type: "primitive",
        mark: {
          type: "cursor",
        },
      },
    ]
  );

  const editor = vscode.window.activeTextEditor;
  assert.equal(editor?.document?.uri?.scheme, "file");
  assert.equal(editor?.document.getText().trimEnd(), "hello world");
}
