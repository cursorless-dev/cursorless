import {
  Command,
  HatStability,
  SpyIDE,
  asyncSafety,
  getRecordedTestPaths,
  runRecordedTest,
} from "@cursorless/common";
import {
  getCursorlessApi,
  openNewTestEditor,
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
      asyncSafety(() => runTest(this, path, getSpy()!)),
    ),
  );
});

async function runTest(suite: Mocha.Suite, file: string, spyIde: SpyIDE) {
  await runRecordedTest(
    suite,
    file,
    spyIde,
    () => {
      return true;
    },
    async (content: string, languageId: string) => {
      return await openNewTestEditor(content, {
        languageId,
      });
    },
    sleepWithBackoff,
    getCursorlessApi,
    runCursorlessCommand as (command: Command) => Promise<any>,
  );
}
