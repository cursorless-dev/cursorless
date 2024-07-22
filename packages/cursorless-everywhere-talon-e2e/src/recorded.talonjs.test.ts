import {
  asyncSafety,
  CURSORLESS_COMMAND_ID,
  DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST,
  type Command,
  type TextEditor,
} from "@cursorless/common";
import {
  activate,
  type EditorState,
  type TalonJsIDE,
} from "@cursorless/cursorless-everywhere-talon-core";
import {
  getRecordedTestPaths,
  loadFixture,
  runRecordedTest,
} from "@cursorless/node-common";
import { constructTestHelpers } from "./constructTestHelpers";
import { endToEndTestSetup } from "./endToEndTestSetUp";
import talonMock from "./talonMock";

suite("TalonJS: Recorded test cases", async function () {
  const ide = await activate(talonMock, "test");
  const ideTestHelpers = ide.testHelpers!;
  const { getSpy } = endToEndTestSetup(this, ideTestHelpers);

  const tests = getRecordedTestPaths();

  for (const { name, path } of tests) {
    test(
      name,
      asyncSafety(async () => {
        const shouldSkip = await shouldSkipTest(path);
        if (shouldSkip) {
          this.ctx.skip();
        }

        await runRecordedTest({
          path,
          spyIde: getSpy(),
          openNewTestEditor: (content, languageId) =>
            openNewTestEditor(ideTestHelpers.talonJsIDE, content, languageId),
          sleepWithBackoff,
          testHelpers: constructTestHelpers(ideTestHelpers),
          runCursorlessCommand,
        });
      }),
    );
  }
});

async function shouldSkipTest(path: string): Promise<boolean> {
  const fixture = await loadFixture(path);

  if (
    fixture.initialState.marks != null &&
    Object.keys(fixture.initialState.marks).length > 0
  ) {
    return true;
  }

  if (fixture.languageId !== "plaintext") {
    return true;
  }

  return false;
}

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
  const editorState: EditorState = {
    text: content,
    languageId,
    selections: [],
  };
  ide.updateTextEditors(editorState);
  talonMock.getTestHelpers().setEditorState(editorState);

  const editor = ide.activeTextEditor;

  if (editor == null) {
    throw new Error("Could not open new editor.");
  }

  // Override any user settings and make sure tests run with default tabs.
  editor.options = DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST;

  return editor;
}
