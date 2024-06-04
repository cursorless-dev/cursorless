import {
  DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST,
  HatStability,
  TextEditor,
  asyncSafety,
  getRecordedTestPaths,
  runRecordedTest,
} from "@cursorless/common";
import {
  getCursorlessApi,
  openNewEditor,
  runCursorlessCommand,
} from "@cursorless/vscode-common";
import * as vscode from "vscode";
import { endToEndTestSetup, sleepWithBackoff } from "../endToEndTestSetup";
import { setupFake } from "./setupFake";

suite("recorded test cases", async function () {
  const { getSpy } = endToEndTestSetup(this);

  suiteSetup(async () => {
    // Necessary because opening a notebook opens the panel for some reason
    await vscode.commands.executeCommand("workbench.action.closePanel");
    const { ide } = (await getCursorlessApi()).testHelpers!;
    setupFake(ide, HatStability.stable);
  });

  getRecordedTestPaths().forEach(({ name, path }) =>
    test(
      name,
      asyncSafety(
        async () =>
          await runRecordedTest({
            path,
            spyIde: getSpy()!,

            openNewTestEditor,

            sleepWithBackoff,
            testHelpers: (await getCursorlessApi()).testHelpers!,
            runCursorlessCommand,
          }),
      ),
    ),
  );
});

async function openNewTestEditor(
  content: string,
  languageId: string,
): Promise<TextEditor> {
  const { fromVscodeEditor } = (await getCursorlessApi()).testHelpers!;

  const editor = await openNewEditor(content, {
    languageId,
    openBeside: false,
  });

  // Override any user settings and make sure tests run with default tabs.
  editor.options = DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST;

  return fromVscodeEditor(editor);
}
