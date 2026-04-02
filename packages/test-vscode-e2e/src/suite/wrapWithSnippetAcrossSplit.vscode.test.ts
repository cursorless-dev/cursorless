import * as assert from "node:assert/strict";
import { HatStability, LATEST_VERSION } from "@cursorless/lib-common";
import {
  getCursorlessApi,
  openNewEditor,
  runCursorlessCommand,
} from "@cursorless/lib-vscode-common";
import { endToEndTestSetup } from "../endToEndTestSetup";
import { setupFake } from "./setupFake";

suite("Wrap with snippet across split", function () {
  endToEndTestSetup(this);

  suiteSetup(async () => {
    const { ide } = (await getCursorlessApi()).testHelpers!;
    setupFake(ide, HatStability.stable);
  });

  test("Wrap with snippet across split", runTest);
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
      name: "wrapWithSnippet",
      snippetDescription: {
        type: "custom",
        body: "My friend $foo likes to eat spaghetti!",
        variableName: "foo",
      },
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

  assert.equal(
    document1.getText(),
    "My friend hello likes to eat spaghetti! world",
  );
  assert.equal(document2.getText(), "");
}
