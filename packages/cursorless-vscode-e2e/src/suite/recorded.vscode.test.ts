import type { TextEditor } from "@cursorless/common";
import {
  DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST,
  HatStability,
  asyncSafety,
} from "@cursorless/common";
import { getRecordedTestPaths, runRecordedTest } from "@cursorless/node-common";
import type { VscodeTestHelpers } from "@cursorless/vscode-common";
import {
  getCursorlessApi,
  openNewEditor,
  reuseEditor,
  runCursorlessCommand,
} from "@cursorless/vscode-common";
import * as vscode from "vscode";
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

let testHelpers: VscodeTestHelpers | undefined;
let vsTextEditor: vscode.TextEditor | undefined;

async function openNewTestEditor(
  content: string,
  languageId: string,
): Promise<TextEditor> {
  if (vsTextEditor == null) {
    vsTextEditor = await openNewEditor(content, { languageId });
  } else {
    vsTextEditor = await reuseEditor(vsTextEditor, content, languageId);
  }

  // Override any user settings and make sure tests run with default tabs.
  vsTextEditor.options = DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST;

  testHelpers ??= (await getCursorlessApi()).testHelpers!;

  return testHelpers.fromVscodeEditor(vsTextEditor);
}
