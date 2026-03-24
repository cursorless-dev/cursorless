import { LATEST_VERSION } from "@cursorless/lib-common";
import {
  getCursorlessApi,
  openNewEditor,
  runCursorlessCommand,
} from "@cursorless/lib-vscode-common";
import * as assert from "node:assert/strict";
import { endToEndTestSetup } from "../endToEndTestSetup";

suite("Pour across split", async function () {
  endToEndTestSetup(this);

  test("Pour across split", runTest);
});

async function runTest() {
  const { hatTokenMap } = (await getCursorlessApi()).testHelpers!;

  const { document: document1 } = await openNewEditor("hello world");
  const { document: document2 } = await openNewEditor("", undefined, true);

  await hatTokenMap.allocateHats();

  await runCursorlessCommand({
    version: LATEST_VERSION,
    usePrePhraseSnapshot: false,
    action: {
      name: "editNewLineAfter",
      target: {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character: "e",
        },
      },
    },
  });

  assert.equal(document1.getText(), "hello world\n");
  assert.equal(document2.getText(), "");
}
