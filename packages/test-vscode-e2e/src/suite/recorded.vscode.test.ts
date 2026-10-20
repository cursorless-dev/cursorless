import vscode from "vscode";
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
  getReusableEditor,
  getParseTreeApi,
  getTestHelpers,
  resetReusableEditor,
  runCursorlessCommand,
} from "@cursorless/lib-vscode-common";
import { endToEndTestSetup, sleepWithBackoff } from "../endToEndTestSetup";
import { setupFake } from "./setupFake";
import { shouldSkipRecordedTest } from "./shouldSkipTest";

suite("recorded test cases", function () {
  const { getSpy } = endToEndTestSetup(this);

  suiteSetup(async () => {
    // Necessary because opening a notebook opens the panel for some reason
    await vscode.commands.executeCommand("workbench.action.closePanel");
    const { ide } = await getTestHelpers();
    setupFake(ide, HatStability.stable);
  });

  for (const { name, path } of getRecordedTestPaths()) {
    test(
      name,
      asyncSafety(async () => {
        if (shouldSkipRecordedTest(name)) {
          this.ctx.skip();
        }

        try {
          await runRecordedTest({
            path,
            spyIde: getSpy(),
            openNewTestEditor,
            sleepWithBackoff,
            testHelpers: await getTestHelpers(),
            runCursorlessCommand,
          });
        } catch (error) {
          // A retry must not inherit the failed attempt's selections or
          // incrementally updated parse tree.
          resetReusableEditor();
          await logFailureContext(name);
          throw error;
        }
      }),
    );
  }
});

async function logFailureContext(name: string): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (editor == null) {
    console.error(`Recorded test failed: ${name}; no active editor`);
    return;
  }

  const { document, selections } = editor;
  console.error(`Recorded test failed: ${name}`, {
    uri: document.uri.toString(),
    languageId: document.languageId,
    version: document.version,
    content: document.getText(),
    selections: selections.map(({ anchor, active }) => ({ anchor, active })),
  });

  try {
    const parseTree = await getParseTreeApi();
    console.error(
      "Parse tree:",
      parseTree.getTreeForUri(document.uri).rootNode.toString(),
    );
  } catch (error) {
    // Diagnostics should preserve the original test failure, including for
    // languages without Tree-sitter support.
    console.error("Could not read parse tree:", error);
  }
}

async function openNewTestEditor(
  content: string,
  languageId: string,
): Promise<TextEditor> {
  const editor = await getReusableEditor(content, languageId);

  // Override any user settings and make sure tests run with default tabs.
  editor.options = DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST;

  const testHelpers = await getTestHelpers();

  return testHelpers.fromVscodeEditor(editor);
}
