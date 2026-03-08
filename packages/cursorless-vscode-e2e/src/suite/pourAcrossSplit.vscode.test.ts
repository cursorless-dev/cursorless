import { LATEST_VERSION } from "@cursorless/common";
import {
  getCursorlessApi,
  openNewEditor,
  runCursorlessCommand,
} from "@cursorless/vscode-common";
import * as assert from "node:assert";
import { endToEndTestSetup } from "../endToEndTestSetup";

suite("Pour across split", async function () {
  endToEndTestSetup(this);

  test("Pour across split", runTest);
});

async function runTest() {
  const { hatTokenMap } = (await getCursorlessApi()).testHelpers!;

  const { document: document1 } = await openNewEditor("hello world");
  const { document: document2 } = await openNewEditor("", { openBeside: true });

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

  assert.deepStrictEqual(document1.getText(), "hello world\n");
  assert.deepStrictEqual(document2.getText(), "");
}
