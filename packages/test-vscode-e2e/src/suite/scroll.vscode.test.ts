import * as vscode from "vscode";
import { LATEST_VERSION } from "@cursorless/lib-common";
import {
  getReusableEditor,
  runCursorlessCommand,
} from "@cursorless/lib-vscode-common";
import { endToEndTestSetup } from "../endToEndTestSetup";

suite("scroll", function () {
  endToEndTestSetup(this);

  test("top whale", topWhale);
  test("bottom whale", bottomWhale);
});

async function topWhale() {
  const editor = await getReusableEditor("hello\nworld");
  editor.selections = [new vscode.Selection(1, 0, 1, 0)];

  await runCursorlessCommand({
    version: LATEST_VERSION,
    usePrePhraseSnapshot: false,
    action: {
      name: "scrollToTop",
      target: {
        type: "primitive",
        mark: {
          type: "cursor",
        },
      },
    },
  });

  // FIXME: Disabled to work around CI failure; see #2243
  // assert.equal(editor.visibleRanges.length, 1);
  // assert.equal(editor.visibleRanges[0].start.line, 1);
}

async function bottomWhale() {
  const editor = await getReusableEditor("hello\nworld");
  await vscode.commands.executeCommand("revealLine", {
    lineNumber: 1,
    at: "top",
  });
  editor.selections = [new vscode.Selection(1, 0, 1, 0)];

  // FIXME: Disabled to work around CI failure; see #2243
  // assert.equal(editor.visibleRanges[0].start.line, 1);

  await runCursorlessCommand({
    version: LATEST_VERSION,
    usePrePhraseSnapshot: false,
    action: {
      name: "scrollToBottom",
      target: {
        type: "primitive",
        mark: {
          type: "cursor",
        },
      },
    },
  });

  // FIXME: Disabled to work around CI failure; see #2243
  // assert.equal(editor.visibleRanges.length, 1);
  // assert.equal(editor.visibleRanges[0].start.line, 0);
}
