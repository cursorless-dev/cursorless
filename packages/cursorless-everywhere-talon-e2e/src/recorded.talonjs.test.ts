// import {
//   DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST,
//   HatStability,
//   TextEditor,
//   asyncSafety,
// } from "@cursorless/common";
// import { getRecordedTestPaths, runRecordedTest } from "@cursorless/node-common";
// import {
//   getCursorlessApi,
//   openNewEditor,
//   runCursorlessCommand,
// } from "@cursorless/vscode-common";
// import * as vscode from "vscode";
// import { endToEndTestSetup, sleepWithBackoff } from "../endToEndTestSetup";
// import { setupFake } from "./setupFake";

import { activate } from "@cursorless/cursorless-everywhere-talon";
import assert from "node:assert";

suite("recorded test cases", async function () {
  const { testHelpers } = await activate("test");
  const { ide } = testHelpers!;

  test("recorded test cases", async function () {
    console.log(ide.runMode);
    assert.fail("Not implemented");
  });

  //   const { getSpy } = endToEndTestSetup(this);

  //   suiteSetup(async () => {
  //     // Necessary because opening a notebook opens the panel for some reason
  //     await vscode.commands.executeCommand("workbench.action.closePanel");
  //     const { ide } = (await getCursorlessApi()).testHelpers!;
  //     setupFake(ide, HatStability.stable);
  //   });

  //   getRecordedTestPaths().forEach(({ name, path }) =>
  //     test(
  //       name,
  //       asyncSafety(
  //         async () =>
  //           await runRecordedTest({
  //             path,
  //             spyIde: getSpy()!,

  //             openNewTestEditor,

  //             sleepWithBackoff,
  //             testHelpers: (await getCursorlessApi()).testHelpers!,
  //             runCursorlessCommand,
  //           }),
  //       ),
  //     ),
  //   );
});

// async function openNewTestEditor(
//   content: string,
//   languageId: string,
// ): Promise<TextEditor> {
//   const { fromVscodeEditor } = (await getCursorlessApi()).testHelpers!;

//   const editor = await openNewEditor(content, {
//     languageId,
//     openBeside: false,
//   });

//   // Override any user settings and make sure tests run with default tabs.
//   editor.options = DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST;

//   return fromVscodeEditor(editor);
// }
