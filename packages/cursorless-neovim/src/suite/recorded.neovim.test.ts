import {
  // asyncSafety,
  CommandResponse,
  // DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST,
  ExcludableSnapshotField,
  // extractTargetedMarks,
  Fallback,
  // HatStability,
  // marksToPlainObject,
  omitByDeep,
  // plainObjectToRange,
  PositionPlainObject,
  // rangeToPlainObject,
  // ReadOnlyHatMap,
  SelectionPlainObject,
  // SerializedMarks,
  serializeTestFixture,
  shouldUpdateFixtures,
  // splitKey,
  SpyIDE,
  spyIDERecordedValuesToPlainObject,
  storedTargetKeys,
  TestCaseFixtureLegacy,
  // TextEditor,
  // TokenHat,
  clientSupportsFallback,
  // TestCaseSnapshot,
  // ExtraSnapshotField,
  // IDE,
  Selection,
  Position,
  getRecordedTestPaths,
  asyncSafety,
  NormalizedIDE,
  getFixturesPath,
} from "@cursorless/common";
// import {
//   getCursorlessApi,
//   openNewEditor,
//   runCursorlessCommand,
// } from "@cursorless/vscode-common";
import { assert } from "chai";
import * as yaml from "js-yaml";
import { isUndefined } from "lodash";
import { promises as fsp } from "node:fs";
// import * as vscode from "vscode";
import { endToEndTestSetup, sleepWithBackoff } from "../endToEndTestSetup";
// import { commandApi } from "../singletons/cmdapi.singleton";
// import { takeSnapshot } from "@cursorless/cursorless-engine";
// import { getCursorlessApi } from "../singletons/cursorlessapi.sLevelingleton";

import { openNewEditor } from "../testUtil/openNewEditor";
import { runCursorlessCommand } from "../runCommand";
import { NeovimIDE } from "../ide/neovim/NeovimIDE";
// import { neovimClient } from "../singletons/client.singleton";
// import { setupFake } from "./setupFake";

function createPosition(position: PositionPlainObject) {
  return new Position(position.line, position.character);
}

function createSelection(selection: SelectionPlainObject): Selection {
  const active = createPosition(selection.active);
  const anchor = createPosition(selection.anchor);
  return new Selection(anchor, active);
}

suite("recorded test cases", async function () {
  const { getSpy } = endToEndTestSetup(this);

  suiteSetup(async () => {
    // Necessary because opening a notebook opens the panel for some reason
    // await vscode.commands.executeCommand("workbench.action.closePanel");
    const getCursorlessApi = await require("@cursorless/cursorless-neovim")
      .getCursorlessApiExternal;
    // debugger;
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
      asyncSafety(() => runTest(path, getSpy()!)),
    );
  }
  // getRecordedTestPaths().forEach(({ name, path }) =>
  //   test(
  //     name,
  //     asyncSafety(() => runTest(path, getSpy()!)),
  //   ),
  // );
});

async function runTest(file: string, spyIde: SpyIDE) {
  const neovimClient = await require("@cursorless/cursorless-neovim")
    .neovimClientExternal;
  const client = neovimClient();
  // TODO: not sure why but ide() returns an SpyIDE but then the
  // test against instanceof SpyIDE fails...
  // const getNeovimIDE = await require("@cursorless/cursorless-neovim")
  //   .getNeovimIDEExternal;
  // const neovimIDE = await getNeovimIDE();
  const normalizedIDE = spyIde.original as NormalizedIDE;
  const neovimIDE = normalizedIDE.original as NeovimIDE;

  const buffer = await fsp.readFile(file);
  const fixture = yaml.load(buffer.toString()) as TestCaseFixtureLegacy;
  const excludeFields: ExcludableSnapshotField[] = [];

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

  // TODO: find a way to distinguish between a skipped test and
  // a failed test
  if (hasMarks || hasMultipleSelections || needTreeSitter) {
    return;
  }

  // Uncomment below for debugging
  // if (name === "recorded/implicitExpansion/chuckBoundingThat") {
  //   console.warn(`runTest(${name}) => let's analyze it`);
  // }

  console.warn(
    "------------------------------------------------------------------------------",
  );
  console.warn(`runTest(${file})...`);

  // FIXME The snapshot gets messed up with timing issues when running the recorded tests
  // "Couldn't find token default.a"
  const usePrePhraseSnapshot = false;

  const getCursorlessApi = await require("@cursorless/cursorless-neovim")
    .getCursorlessApiExternal;
  // debugger;
  const cursorlessApi = await getCursorlessApi();
  const { takeSnapshot, setStoredTarget, commandServerApi, commandApi } =
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
    returnValue = await runCursorlessCommand(
      client,
      neovimIDE,
      commandApi,
      commandServerApi,
      {
        ...fixture.command,
        usePrePhraseSnapshot,
      },
    );
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
  return;
}
