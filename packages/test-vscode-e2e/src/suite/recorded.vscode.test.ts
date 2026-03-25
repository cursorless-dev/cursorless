import * as vscode from "vscode";
import type { TextEditor } from "@cursorless/lib-common";
import {
  DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST,
  HatStability,
  asyncSafety,
} from "@cursorless/lib-common";
import {
  getRecordedTestPaths,
  runRecordedTest,
} from "@cursorless/lib-node-common";
import {
  getCursorlessApi,
  getReusableEditor,
  runCursorlessCommand,
} from "@cursorless/lib-vscode-common";
import { endToEndTestSetup, sleepWithBackoff } from "../endToEndTestSetup";
import { setupFake } from "./setupFake";
import { shouldSkipRecordedTest } from "./shouldSkipTest";

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
      asyncSafety(async () => {
        if (shouldSkipRecordedTest(name)) {
          this.ctx.skip();
        }

        await runRecordedTest({
          path,
          spyIde: getSpy(),
          openNewTestEditor,
          sleepWithBackoff,
          testHelpers: (await getCursorlessApi()).testHelpers!,
          runCursorlessCommand,
        });
      }),
    ),
  );
});

async function openNewTestEditor(
  content: string,
  languageId: string,
): Promise<TextEditor> {
  const editor = await getReusableEditor(content, languageId);

  // Override any user settings and make sure tests run with default tabs.
  editor.options = DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST;

  const testHelpers = (await getCursorlessApi()).testHelpers!;

  return testHelpers.fromVscodeEditor(editor);
}
