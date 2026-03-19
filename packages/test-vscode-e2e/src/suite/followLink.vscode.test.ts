import { LATEST_VERSION } from "@cursorless/lib-common";
import { getFixturePath, isWindows } from "@cursorless/node-common";
import {
  getReusableEditor,
  runCursorlessCommand,
} from "@cursorless/vscode-common";
import * as assert from "assert";
import * as vscode from "vscode";
import { endToEndTestSetup } from "../endToEndTestSetup";

suite("followLink", async function () {
  endToEndTestSetup(this);

  test("follow definition", followDefinition);
  test("follow link", followLink);
});

async function followDefinition() {
  const editor = await getReusableEditor(
    "const foo = 'hello';\nconst bar = foo;",
    "typescript",
  );
  await vscode.commands.executeCommand("revealLine", {
    lineNumber: 1,
    at: "top",
  });
  editor.selections = [new vscode.Selection(1, 12, 1, 15)];

  // FIXME: Disabled to work around CI failure; see #2243
  // assert.equal(editor.visibleRanges[0].start.line, 1);

  await runCursorlessCommand({
    version: LATEST_VERSION,
    usePrePhraseSnapshot: false,
    action: {
      name: "followLink",
      target: {
        type: "primitive",
        mark: {
          type: "cursor",
        },
      },
    },
  });

  // FIXME: Disabled to work around CI failure; see #2243
  // assert.equal(editor.visibleRanges[0].start.line, 0);
}

async function followLink() {
  const filename = getFixturePath("helloWorld.txt");
  const linkTextContent = isWindows()
    ? `file:///${filename}`
    : `file://${filename}`;
  await getReusableEditor(linkTextContent);

  await runCursorlessCommand({
    version: LATEST_VERSION,
    usePrePhraseSnapshot: false,
    action: {
      name: "followLink",
      target: {
        type: "primitive",
        mark: {
          type: "cursor",
        },
      },
    },
  });

  const editor = vscode.window.activeTextEditor;
  assert.equal(editor?.document?.uri?.scheme, "file");
  assert.equal(editor?.document.getText().trimEnd(), "hello world");
}
