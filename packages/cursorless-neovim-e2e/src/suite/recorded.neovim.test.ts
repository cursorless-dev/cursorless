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
  getFixturesPath,
  // getRecordedTestPaths,
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
  //const tests = getRecordedTestPaths();

  // Run some tests
  const fixturePath = getFixturesPath();
  const tests = [
    {
      name: "recorded/actions/changeNextInstanceChar",
      path: `${fixturePath}/recorded/actions/changeNextInstanceChar.yml`,
    },
  ];

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

  // XXX - restore this
  // if (unsupportedFixture(name, fixture)) {
  //   return suite.ctx.skip();
  // }

  // XXX - temp to avoid things to hang on CI
  // if (name !== "recorded/actions/changeNextInstanceChar") {
  //   return suite.ctx.skip();
  // }

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
  // actual finalState.selections.anchor is -1 compared to expected (other fixture.command.action.name == "insertCopyBefore" tests pass fine)
  "recorded/actions/cloneToken4",
  "recorded/actions/cloneUpToken4",
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
];

function isFailingFixture(name: string, fixture: TestCaseFixtureLegacy) {
  const action =
    typeof fixture.command.action === "object"
      ? fixture.command.action.name
      : fixture.command.action;

  // "recorded/actions/insertEmptyLines/puffThis*" -> wrong fixture.finalState.selections and fixture.thatMark.contentRange
  if (action === "insertEmptyLinesAround") {
    return true;
  }

  // "recorded/actions/insertEmptyLines/floatThis*" ->    Error: nvim_buf_get_lines: Index out of bounds
  //                                                -> or actual finalState.selections.anchor is -1 compared to expected
  //                                                      actual finalState.thatMark.contentRange.start is -1 compared to expected
  if (action === "insertEmptyLineAfter") {
    return true;
  }

  // "recorded/actions/insertEmptyLines/dropThis*"  -> wrong fixture.finalState.selections and fixture.thatMark.contentRange
  if (action === "insertEmptyLineBefore") {
    return true;
  }
  // "recorded/actions/cloneToken*" and "recorded/itemTextual/cloneTwoItems" -> wrong fixture.finalState.selections and fixture.thatMark.contentRange
  if (action === "insertCopyAfter") {
    return true;
  }

  // "recorded/implicitExpansion/pour*" -> not supported for now
  if (action === "editNewLineAfter") {
    return true;
  }

  // "recorded/actions/{decrement,increment}File" -> are not supported atm
  if (action === "decrement" || action === "increment") {
    return true;
  }

  // ""recorded/actions/snippets/*" -> not supported for now
  if (action === "insertSnippet" || action === "wrapWithSnippet") {
    return true;
  }

  // "recorded/actions/{join,breakJustThis}*"" -> wrong fixture.finalState.selections and fixture.thatMark.contentRange
  if (action === "breakLine" || action === "joinLines") {
    return true;
  }

  // "recorded/actions/shuffleThis" is not supported atm
  if (action === "randomizeTargets") {
    return true;
  }

  // "recorded/actions/pasteBeforeToken" -> wrong fixture.finalState.documentContents/selections/thatMark
  if (action === "pasteFromClipboard") {
    return true;
  }

  // "recorded/actions/copySecondToken" -> wrong fixture.finalState.clipboard
  if (action === "copyToClipboard") {
    return true;
  }

  // "recorded/lineEndings/*" -> fixture.finalState.documentContents contains \n instead of \r\n
  if (name.includes("/lineEndings/")) {
    return true;
  }

  // "recorded/fallback/take*" -> wrong fixture.finalState.selections
  if (name.includes("/fallback/take")) {
    return true;
  }

  // We blacklist remaining unsorted failing tests
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
