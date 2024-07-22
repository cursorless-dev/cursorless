import {
  asyncSafety,
  CURSORLESS_COMMAND_ID,
  DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST,
  type Command,
  type TextEditor,
} from "@cursorless/common";
import {
  activate,
  type TalonJsIDE,
} from "@cursorless/cursorless-everywhere-talon-core";
import { getRecordedTestPaths, runRecordedTest } from "@cursorless/node-common";
import { constructTestHelpers } from "./constructTestHelpers";
import { endToEndTestSetup } from "./endToEndTestSetUp";
import talonMock from "./talonMock";

suite("TalonJS: Recorded test cases", async function () {
  const ide = await activate(talonMock, "test");
  const ideTestHelpers = ide.testHelpers!;
  const { getSpy } = endToEndTestSetup(this, ideTestHelpers);

  getRecordedTestPaths().forEach(({ name, path }) =>
    test(
      name,
      asyncSafety(
        async () =>
          await runRecordedTest({
            path,
            spyIde: getSpy(),
            openNewTestEditor: (content, languageId) =>
              openNewTestEditor(ideTestHelpers.talonJsIDE, content, languageId),
            sleepWithBackoff,
            testHelpers: constructTestHelpers(ideTestHelpers),
            runCursorlessCommand,
          }),
      ),
    ),
  );
});

function sleepWithBackoff(_ms: number): Promise<void> {
  return Promise.resolve();
}

function runCursorlessCommand(command: Command) {
  return talonMock
    .getTestHelpers()
    .contextActions.private_cursorless_run_rpc_command_get(
      CURSORLESS_COMMAND_ID,
      command,
    );
}

async function openNewTestEditor(
  ide: TalonJsIDE,
  content: string,
  languageId: string,
): Promise<TextEditor> {
  ide.updateTextEditors({
    text: content,
    languageId,
    selections: [],
  });

  const editor = ide.activeTextEditor!;

  // Override any user settings and make sure tests run with default tabs.
  editor.options = DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST;

  return editor;
}
