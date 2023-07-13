import {
  getCursorlessApi,
  openNewEditor,
  runCursorlessCommand,
} from "@cursorless/vscode-common";
import * as assert from "assert";
import { endToEndTestSetup } from "../endToEndTestSetup";

suite("getText", async function () {
  endToEndTestSetup(this);

  test("getText", getText);
});

async function getText() {
  const { hatTokenMap } = (await getCursorlessApi()).testHelpers!;
  await openNewEditor("foo bar baz");
  await hatTokenMap.allocateHats();

  const result = await runCursorlessCommand({
    version: 6,
    usePrePhraseSnapshot: false,
    action: {
      name: "getText",
      target: {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character: "b",
        },
      },
    },
  });

  assert.equal(result, "bar");
}
