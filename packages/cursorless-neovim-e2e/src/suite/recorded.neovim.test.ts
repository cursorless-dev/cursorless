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
      asyncSafety(() => runTest(this, path, getSpy()!, getNeovimIDE()!)),
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
  file: string,
  spyIde: SpyIDE,
  neovimIDE: NeovimIDE,
) {
  const client = (global as any).additionalParameters.client;

  const buffer = await fsp.readFile(file);
  const fixture = yaml.load(buffer.toString()) as TestCaseFixtureLegacy;
  const excludeFields: ExcludableSnapshotField[] = [];

  if (unsupportedFixture(fixture)) {
    return suite.ctx.skip();
  }

  // Uncomment below for debugging
  // if (name === "recorded/implicitExpansion/chuckBoundingThat") {
  //   console.log(`runTest(${name}) => let's analyze it`);
  // }

  console.log(
    "------------------------------------------------------------------------------",
  );
  console.log(`runTest(${file})...`);

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

function unsupportedFixture(fixture: TestCaseFixtureLegacy) {
  // TODO: skip tests based on common patterns
  // black list if only a few tests don't have a common pattern

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
  return false;
}
