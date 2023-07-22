import {
  getCursorlessApi,
  openNewEditor,
  runCursorlessCommand,
} from "@cursorless/vscode-common";
import * as assert from "assert";
import { Selection } from "vscode";
import { endToEndTestSetup } from "../endToEndTestSetup";

suite("Explicit mark", async function () {
  endToEndTestSetup(this);

  test("Clear explicit mark", explicitMark);
});

async function explicitMark() {
  const { ide } = (await getCursorlessApi()).testHelpers!;
  const editor = await openNewEditor("foo bar baz");
  const editorId = ide.visibleTextEditors[0].id;

  await runCursorlessCommand({
    version: 6,
    usePrePhraseSnapshot: false,
    action: {
      name: "clearAndSetSelection",
      target: {
        type: "primitive",
        mark: {
          type: "explicit",
          editorId,
          range: {
            start: { line: 0, character: 4 },
            end: { line: 0, character: 7 },
          },
        },
      },
    },
  });

  assert.equal(editor.document.getText(), "foo  baz");
  assert.equal(editor.selections.length, 1);
  assert.ok(editor.selections[0].isEqual(new Selection(0, 4, 0, 4)));
}
