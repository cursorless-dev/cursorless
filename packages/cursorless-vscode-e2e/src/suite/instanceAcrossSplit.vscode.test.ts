import {
  HatStability,
  Modifier,
  Range,
  SpyIDE,
  asyncSafety,
} from "@cursorless/common";
import {
  getCursorlessApi,
  openNewEditor,
  runCursorlessCommand,
} from "@cursorless/vscode-common";
import * as assert from "assert";
import { Selection } from "vscode";
import { endToEndTestSetup } from "../endToEndTestSetup";
import { setupFake } from "./setupFake";

// Ensure that the "from" / "instance" work properly when "from"
// is run in a different editor from "instance"
suite("Instance across split", async function () {
  const { getSpy } = endToEndTestSetup(this);

  suiteSetup(async () => {
    const { ide } = (await getCursorlessApi()).testHelpers!;
    setupFake(ide, HatStability.stable);
  });

  test(
    "Every instance",
    asyncSafety(() =>
      runTest(
        getSpy(),
        {
          type: "everyScope",
          scopeType: { type: "instance" },
        },
        true,
        "  bbb  ",
      ),
    ),
  );
  test(
    "Next instance",
    asyncSafety(() =>
      runTest(
        getSpy(),
        {
          type: "relativeScope",
          scopeType: { type: "instance" },
          direction: "forward",
          length: 1,
          offset: 1,
        },
        false,
        "  bbb aaa aaa",
      ),
    ),
  );
  test(
    "Two instances",
    asyncSafety(() =>
      runTest(
        getSpy(),
        {
          type: "relativeScope",
          scopeType: { type: "instance" },
          direction: "forward",
          length: 2,
          offset: 0,
        },
        false,
        "  bbb  aaa",
      ),
    ),
  );
  test(
    "Second instance",
    asyncSafety(() =>
      runTest(
        getSpy(),
        {
          type: "ordinalScope",
          scopeType: { type: "instance" },
          length: 1,
          start: 1,
        },
        true,
        " aaa bbb  aaa",
      ),
    ),
  );
});

async function runTest(
  spyIde: SpyIDE,
  modifier: Modifier,
  useWholeFile: boolean,
  expectedContents: string,
) {
  const { hatTokenMap } = (await getCursorlessApi()).testHelpers!;

  const { document: instanceDocument } = await openNewEditor("aaa");
  /** The editor containing the "instance" */
  const instanceEditor = spyIde.activeTextEditor!;
  /** The editor in which "from" is run */
  const fromEditor = await openNewEditor(" aaa bbb aaa aaa", {
    openBeside: true,
  });
  const { document: fromDocument } = fromEditor;
  fromEditor.selections = [new Selection(0, 0, 0, 0)];

  await hatTokenMap.allocateHats([
    {
      grapheme: "a",
      hatStyle: "default",
      hatRange: new Range(0, 0, 0, 1),
      token: {
        editor: instanceEditor,
        offsets: { start: 0, end: 3 },
        range: new Range(0, 0, 0, 3),
        text: "aaa",
      },
    },
  ]);

  // "from this" / "from file this", depending on the value of `useWholeFile`
  await runCursorlessCommand({
    version: 6,
    action: {
      name: "experimental.setInstanceReference",
      target: {
        type: "primitive",
        mark: {
          type: "cursor",
        },
        modifiers: useWholeFile
          ? [{ type: "containingScope", scopeType: { type: "document" } }]
          : [],
      },
    },
    usePrePhraseSnapshot: false,
  });

  // "change <modifier> air", where <modifier> is some kind of "instance"
  // modifier
  await runCursorlessCommand({
    version: 6,
    action: {
      name: "clearAndSetSelection",
      target: {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character: "a",
        },
        modifiers: [modifier],
      },
    },
    usePrePhraseSnapshot: false,
  });

  assert.deepStrictEqual(instanceDocument.getText(), "aaa");
  assert.deepStrictEqual(fromDocument.getText(), expectedContents);
}
