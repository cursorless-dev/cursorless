import {
  CommandResponse,
  ExcludableSnapshotField,
  Fallback,
  Position,
  PositionPlainObject,
  Selection,
  SelectionPlainObject,
  SpyIDE,
  TestCaseFixtureLegacy,
  asyncSafety,
  clientSupportsFallback,
  getRecordedTestPaths,
  omitByDeep,
  serializeTestFixture,
  shouldUpdateFixtures,
  spyIDERecordedValuesToPlainObject,
  storedTargetKeys,
} from "@cursorless/common";
import {
  NeovimIDE,
  getCursorlessApi,
  openNewEditor,
  runCursorlessCommand,
} from "@cursorless/neovim-common";
import { assert } from "chai";
import * as yaml from "js-yaml";
import { isUndefined } from "lodash";
import { promises as fsp } from "node:fs";
import { endToEndTestSetup, sleepWithBackoff } from "../endToEndTestSetup";

function createPosition(position: PositionPlainObject) {
  return new Position(position.line, position.character);
}

function createSelection(selection: SelectionPlainObject): Selection {
  const active = createPosition(selection.active);
  const anchor = createPosition(selection.anchor);
  return new Selection(anchor, active);
}

suite("recorded test cases", async function () {
  const { getSpy, getNeovimIDE } = endToEndTestSetup(this);

  suiteSetup(async () => {
    // Necessary because opening a notebook opens the panel for some reason
    // await vscode.commands.executeCommand("workbench.action.closePanel");
    const { ide } = (await getCursorlessApi()).testHelpers!;
    // setupFake(ide, HatStability.stable);
  });

  // Run all tests
  const tests = getRecordedTestPaths();

  // Run some tests
  // const fixturePath = getFixturesPath();
  // const tests = [
  //   {
  //     name: "recorded/actions/insertEmptyLines/dropThis",
  //     path: `${fixturePath}/recorded/actions/insertEmptyLines/dropThis.yml`,
  //   },
  // ];

  for (const { name, path } of tests) {
    test(
      name,
      asyncSafety(() => runTest(this, name, path, getSpy()!, getNeovimIDE()!)),
    );
  }
  // getRecordedTestPaths().forEach(({ name, path }) =>
  //   test(
  //     name,
  //     asyncSafety(() => runTest(path, getSpy()!, getNeovimIDE()!)),
  //   ),
  // );
});

async function runTest(
  suite: Mocha.Suite,
  name: string,
  file: string,
  spyIde: SpyIDE,
  neovimIDE: NeovimIDE,
) {
  const client = (global as any).additionalParameters.client;

  const buffer = await fsp.readFile(file);
  const fixture = yaml.load(buffer.toString()) as TestCaseFixtureLegacy;
  const excludeFields: ExcludableSnapshotField[] = [];

  if (unsupportedFixture(name, fixture)) {
    return suite.ctx.skip();
  }

  // Uncomment below for debugging
  // if (name === "recorded/implicitExpansion/chuckBoundingThat") {
  //   console.debug(`runTest(${name}) => let's analyze it`);
  // }

  console.debug(
    "------------------------------------------------------------------------------",
  );
  console.debug(`runTest(${file})...`);

  // FIXME The snapshot gets messed up with timing issues when running the recorded tests
  // "Couldn't find token default.a"
  const usePrePhraseSnapshot = false;

  const cursorlessApi = await getCursorlessApi();
  const { takeSnapshot, setStoredTarget, commandServerApi } =
    cursorlessApi.testHelpers!;

  const editor = await openNewEditor(
    client,
    neovimIDE,
    fixture.initialState.documentContents,
    {
      languageId: fixture.languageId,
    },
  );

  // Override any user settings and make sure tests run with default tabs.
  //editor.options = DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST;

  if (fixture.postEditorOpenSleepTimeMs != null) {
    await sleepWithBackoff(fixture.postEditorOpenSleepTimeMs);
  }

  await editor.setSelections(
    fixture.initialState.selections.map(createSelection),
  );

  for (const storedTargetKey of storedTargetKeys) {
    const key = `${storedTargetKey}Mark` as const;
    setStoredTarget(editor, storedTargetKey, fixture.initialState[key]);
  }

  if (fixture.initialState.clipboard) {
    spyIde.clipboard.writeText(fixture.initialState.clipboard);
  }

  commandServerApi.setFocusedElementType(
    fixture.focusedElementType === "other"
      ? undefined
      : fixture.focusedElementType ?? "textEditor",
  );

  // NOT NEEDED FOR NOW
  // Ensure that the expected hats are present
  // Assert that recorded decorations are present

  let returnValue: unknown;
  let fallback: Fallback | undefined;

  try {
    returnValue = await runCursorlessCommand({
      ...fixture.command,
      usePrePhraseSnapshot,
    });
    if (clientSupportsFallback(fixture.command)) {
      const commandResponse = returnValue as CommandResponse;
      returnValue =
        "returnValue" in commandResponse
          ? commandResponse.returnValue
          : undefined;
      fallback =
        "fallback" in commandResponse ? commandResponse.fallback : undefined;
    }
  } catch (err) {
    const error = err as Error;

    if (shouldUpdateFixtures()) {
      const outputFixture = {
        ...fixture,
        finalState: undefined,
        decorations: undefined,
        returnValue: undefined,
        thrownError: { name: error.name },
      };

      await fsp.writeFile(file, serializeTestFixture(outputFixture));
    } else if (fixture.thrownError != null) {
      assert.strictEqual(
        error.name,
        fixture.thrownError.name,
        "Unexpected thrown error",
      );
    } else {
      throw error;
    }

    return;
  }

  if (fixture.postCommandSleepTimeMs != null) {
    await sleepWithBackoff(fixture.postCommandSleepTimeMs);
  }

  // We don't support decorated symbol marks (hats) yet
  const marks = undefined;

  if (fixture.finalState?.clipboard == null) {
    excludeFields.push("clipboard");
  }

  for (const storedTargetKey of storedTargetKeys) {
    const key = `${storedTargetKey}Mark` as const;
    if (fixture.finalState?.[key] == null) {
      excludeFields.push(key);
    }
  }

  // FIXME Visible ranges are not asserted, see:
  // https://github.com/cursorless-dev/cursorless/issues/160
  const { visibleRanges, ...resultState } = await takeSnapshot(
    excludeFields,
    [],
    spyIde.activeTextEditor!,
    spyIde,
    marks,
    false,
  );

  const rawSpyIdeValues = spyIde.getSpyValues(fixture.ide?.flashes != null);
  const actualSpyIdeValues =
    rawSpyIdeValues == null
      ? undefined
      : spyIDERecordedValuesToPlainObject(rawSpyIdeValues);

  if (shouldUpdateFixtures()) {
    const outputFixture: TestCaseFixtureLegacy = {
      ...fixture,
      finalState: resultState,
      returnValue,
      fallback,
      ide: actualSpyIdeValues,
      thrownError: undefined,
    };

    await fsp.writeFile(file, serializeTestFixture(outputFixture));
  } else {
    if (fixture.thrownError != null) {
      throw Error(
        `Expected error ${fixture.thrownError.name} but none was thrown`,
      );
    }

    assert.deepStrictEqual(
      resultState,
      fixture.finalState,
      "Unexpected final state",
    );

    assert.deepStrictEqual(
      returnValue,
      fixture.returnValue,
      "Unexpected return value",
    );

    assert.deepStrictEqual(
      fallback,
      fixture.fallback,
      "Unexpected fallback value",
    );

    assert.deepStrictEqual(
      omitByDeep(actualSpyIdeValues, isUndefined),
      fixture.ide,
      "Unexpected ide captured values",
    );
  }
}

const failingFixtures = [
  // fixture.command.action.name == "breakLine" -> wrong fixture.finalState.selections and fixture.thatMark.contentRange
  "recorded/actions/breakJustThis",
  "recorded/actions/breakJustThis2",
  // fixture.command.action.name == "insertCopyAfter" -> wrong fixture.finalState.selections and fixture.thatMark.contentRange
  "recorded/actions/cloneToken",
  "recorded/actions/cloneToken2",
  "recorded/actions/cloneToken3",
  "recorded/actions/cloneToken4",
  "recorded/actions/cloneToken5",
  // fixture.command.action.name == "insertCopyAfter" -> wrong fixture.finalState.selections (no test on fixture.thatMark.contentRange)
  "recorded/itemTextual/cloneTwoItems",
  // actual finalState.selections.anchor is -1 compared to expected (other fixture.command.action.name == "insertCopyBefore" tests pass fine)
  "recorded/actions/cloneToken4",
  "recorded/actions/cloneUpToken4",
  // fixture.command.action.name == "decrement" / "increment" are not supported atm
  "recorded/actions/decrementFile",
  "recorded/actions/incrementFile",
  // fixture.command.action.name == "insertEmptyLineBefore" -> wrong fixture.finalState.selections and fixture.thatMark.contentRange
  "recorded/actions/insertEmptyLines/dropThis",
  "recorded/actions/insertEmptyLines/dropThis2",
  "recorded/actions/insertEmptyLines/dropThis3",
  "recorded/actions/insertEmptyLines/dropThis4",
  "recorded/actions/insertEmptyLines/dropThis5",
  "recorded/actions/insertEmptyLines/dropThis6",
  "recorded/actions/insertEmptyLines/dropThis7",
  "recorded/actions/insertEmptyLines/dropThis8",
  "recorded/actions/insertEmptyLines/dropThis9",
  "recorded/actions/insertEmptyLines/dropThis10",
  "recorded/actions/insertEmptyLines/dropThis11",
  "recorded/actions/insertEmptyLines/dropThis12",
  // fixture.command.action.name == "insertEmptyLineAfter" ->    Error: nvim_buf_get_lines: Index out of bounds
  //                                                -> or actual finalState.selections.anchor is -1 compared to expected
  //                                                      actual finalState.thatMark.contentRange.start is -1 compared to expected
  "recorded/actions/insertEmptyLines/floatThis",
  "recorded/actions/insertEmptyLines/floatThis2",
  "recorded/actions/insertEmptyLines/floatThis3",
  "recorded/actions/insertEmptyLines/floatThis4",
  "recorded/actions/insertEmptyLines/floatThis5",
  "recorded/actions/insertEmptyLines/floatThis6",
  "recorded/actions/insertEmptyLines/floatThis7",
  "recorded/actions/insertEmptyLines/floatThis8",
  "recorded/actions/insertEmptyLines/floatThis9",
  "recorded/actions/insertEmptyLines/floatThis10",
  "recorded/actions/insertEmptyLines/floatThis11",
  "recorded/actions/insertEmptyLines/floatThis12",
  "recorded/actions/insertEmptyLines/floatThis13",
  // fixture.command.action.name == "insertEmptyLinesAround" ->  wrong fixture.finalState.selections and fixture.thatMark.contentRange
  "recorded/actions/insertEmptyLines/puffThis",
  "recorded/actions/insertEmptyLines/puffThis2",
  "recorded/actions/insertEmptyLines/puffThis3",
  "recorded/actions/insertEmptyLines/puffThis4",
  "recorded/actions/insertEmptyLines/puffThis5",
  "recorded/actions/insertEmptyLines/puffThis6",
  "recorded/actions/insertEmptyLines/puffThis7",
  "recorded/actions/insertEmptyLines/puffThis8",
  "recorded/actions/insertEmptyLines/puffThis9",
  "recorded/actions/insertEmptyLines/puffThis10",
  "recorded/actions/insertEmptyLines/puffThis11",
  "recorded/actions/insertEmptyLines/puffThis12",
  "recorded/actions/insertEmptyLines/puffThis13",
  "recorded/actions/insertEmptyLines/puffThis14",
  "recorded/actions/insertEmptyLines/puffThis15",
  "recorded/actions/insertEmptyLines/puffThis16",
  "recorded/actions/insertEmptyLines/puffThis17",
  "recorded/actions/insertEmptyLines/puffThis18",
  "recorded/actions/insertEmptyLines/puffThis19",
  "recorded/actions/insertEmptyLines/puffThis20",
  "recorded/actions/insertEmptyLines/puffThis21",
  "recorded/actions/insertEmptyLines/puffThis22",
  // fixture.command.action.name == "joinLines" ->  wrong fixture.finalState.selections and fixture.thatMark.contentRange
  //      NOTE: "recorded/actions/joinLineThis" is the only fixture.command.action.name == "joinLines" that succeeds atm
  "recorded/actions/joinBlock",
  "recorded/actions/joinFile",
  "recorded/actions/joinTwoLines",
  // fixture.command.action.name == "insertSnippet" is not supported atm
  "recorded/actions/snippets/customInsert",
  "recorded/actions/snippets/customInsertHelloWorld",
  "recorded/actions/snippets/snipDuplicatedDuplicatedHelloWorld",
  "recorded/actions/snippets/snipSpaghetti",
  "recorded/actions/snippets/snipSpaghettiGraceHopper",
  // fixture.command.action.name == "wrapWithSnippet" is not supported atm
  "recorded/actions/snippets/customWrapLine",
  "recorded/actions/snippets/customWrapLine2",
  "recorded/actions/snippets/duplicatedDuplicatedWrapThis",
  // -> Error: nvim_execute_lua: Cursor position outside buffer
  "recorded/compoundTargets/chuckStartOfBlockPastStartOfFile",
  // actual finalState.selections.anchor is -1 compared to expected
  "recorded/implicitExpansion/chuckCoreThat",
  "recorded/implicitExpansion/chuckLeadingThat",
  "recorded/marks/chuckNothing",
  // -> wrong fixture.finalState.selections
  "recorded/implicitExpansion/cloneThat2",
  "recorded/implicitExpansion/cloneThis",
  "recorded/implicitExpansion/cloneThis2",
  // fixture.command.action.name == "editNewLineAfter" is not supported atm
  "recorded/implicitExpansion/pourThat",
  "recorded/implicitExpansion/pourThat2",
  "recorded/implicitExpansion/pourThis",
  "recorded/implicitExpansion/pourThis2",
  // fixture.finalState.documentContents contains \n instead of \r\n
  "recorded/lineEndings/clearCoreFileCRLF",
  "recorded/lineEndings/pourBlockCRLF",
  "recorded/lineEndings/pourItemCRLF",
  // fixture.command.action.name == "randomizeTargets" is not supported atm
  "recorded/actions/shuffleThis",
  // fixture.command.action.name == "pasteFromClipboard" -> wrong fixture.finalState.documentContents/selections/thatMark
  "recorded/actions/pasteBeforeToken",
];

function isFailingFixture(name: string, fixture: TestCaseFixtureLegacy) {
  if (failingFixtures.includes(name)) {
    return true;
  }
}

function unsupportedFixture(name: string, fixture: TestCaseFixtureLegacy) {
  // We don't support decorated symbol marks (hats) yet
  const hasMarks =
    fixture.initialState.marks != null &&
    Object.keys(fixture.initialState.marks).length > 0;

  // we don't support multiple selections in neovim (we don't support multiple cursors atm)
  const hasMultipleSelections =
    fixture.initialState.selections.length > 1 ||
    (fixture.finalState && fixture.finalState.selections.length > 1);

  // We don't support Tree sitter yet (which requires a code languageId)
  const needTreeSitter = fixture.languageId !== "plaintext";

  if (hasMarks || hasMultipleSelections || needTreeSitter) {
    return true;
  }

  // Fixtures that will need to be fixed in the future
  if (isFailingFixture(name, fixture)) {
    return true;
  }

  return false;
}
