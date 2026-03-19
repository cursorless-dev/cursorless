import type { EnforceUndefined } from "@cursorless/lib-common";
import {
  FakeCommandServerApi,
  FakeIDE,
  NormalizedIDE,
} from "@cursorless/lib-common";
import type { EngineProps } from "@cursorless/cursorless-engine";
import {
  CommandHistory,
  createCursorlessEngine,
} from "@cursorless/cursorless-engine";
import {
  FileSystemCommandHistoryStorage,
  FileSystemRawTreeSitterQueryProvider,
  FileSystemTalonSpokenForms,
} from "@cursorless/node-common";
import {
  ScopeTestRecorder,
  TestCaseRecorder,
} from "@cursorless/test-case-recorder";
import type { CursorlessApi } from "@cursorless/vscode-common";
import {
  getCommandServerApi,
  getParseTreeApi,
} from "@cursorless/vscode-common";
import type { ExtensionContext } from "vscode";
import { InstallationDependencies } from "./InstallationDependencies";
import { ReleaseNotes } from "./ReleaseNotes";
import { ScopeTreeProvider } from "./ScopeTreeProvider";
import { StatusBarItem } from "./StatusBarItem";
import { VscodeSnippets } from "./VscodeSnippets";
import { constructTestHelpers } from "./constructTestHelpers";
import { createScopeVisualizer } from "./createScopeVisualizer";
import { createTreeSitter } from "./createTreeSitter";
import { createTutorial } from "./createTutorial";
import { createVscodeIde } from "./createVscodeIde";
import { KeyboardCommands } from "./keyboard/KeyboardCommands";
import { registerCommands } from "./registerCommands";
import { revisualizeOnCustomRegexChange } from "./revisualizeOnCustomRegexChange";
import { storedTargetHighlighter } from "./storedTargetHighlighter";
import { vscodeApi } from "./vscodeApi";

/**
 * Extension entrypoint called by VSCode on Cursorless startup.
 * - Creates a dependency container {@link Graph} with the components that
 * implement Cursorless.
 * - Creates test case recorder {@link TestCaseRecorder} for contributors to
 * use to record test cases.
 * - Creates an entrypoint for running commands {@link CommandRunner}.
 */
export async function activate(
  context: ExtensionContext,
): Promise<CursorlessApi> {
  const parseTreeApi = await getParseTreeApi();
  const treeSitter = createTreeSitter(parseTreeApi);

  const { vscodeIDE, hats, fileSystem } = await createVscodeIde(context);
  const isTesting = vscodeIDE.runMode === "test";

  const normalizedIde =
    vscodeIDE.runMode === "production"
      ? vscodeIDE
      : new NormalizedIDE(vscodeIDE, new FakeIDE(), isTesting);

  const fakeCommandServerApi = new FakeCommandServerApi();
  const commandServerApi = isTesting
    ? fakeCommandServerApi
    : await getCommandServerApi();

  const talonSpokenForms = new FileSystemTalonSpokenForms(fileSystem);

  const snippets = new VscodeSnippets(normalizedIde);

  const treeSitterQueryProvider = new FileSystemRawTreeSitterQueryProvider(
    normalizedIde,
    fileSystem,
  );
  context.subscriptions.push(treeSitterQueryProvider);

  const engineProps: EnforceUndefined<EngineProps> = {
    ide: normalizedIde,
    hats,
    treeSitterQueryProvider,
    treeSitter,
    commandServerApi,
    talonSpokenForms,
    snippets,
  };

  const {
    commandApi,
    storedTargets,
    hatTokenMap,
    scopeProvider,
    injectIde,
    loadLanguage,
    addCommandRunnerDecorator,
    customSpokenFormGenerator,
  } = await createCursorlessEngine(engineProps);

  const commandHistoryStorage = new FileSystemCommandHistoryStorage(
    fileSystem.cursorlessCommandHistoryDirPath,
  );

  addCommandRunnerDecorator(
    new CommandHistory(normalizedIde, commandHistoryStorage, commandServerApi),
  );

  const testCaseRecorder = new TestCaseRecorder(
    normalizedIde,
    commandServerApi,
    hatTokenMap,
    storedTargets,
    injectIde,
  );
  addCommandRunnerDecorator(testCaseRecorder);

  const scopeTestRecorder = new ScopeTestRecorder(normalizedIde);

  const statusBarItem = StatusBarItem.create("cursorless.showQuickPick");
  context.subscriptions.push(statusBarItem);

  const keyboardCommands = KeyboardCommands.create(
    context,
    vscodeApi,
    statusBarItem,
  );
  const scopeVisualizer = createScopeVisualizer(normalizedIde, scopeProvider);
  context.subscriptions.push(
    revisualizeOnCustomRegexChange(scopeVisualizer, scopeProvider),
  );

  new ScopeTreeProvider(
    normalizedIde,
    vscodeApi,
    context,
    scopeProvider,
    scopeVisualizer,
    customSpokenFormGenerator,
    commandServerApi != null,
  );

  const installationDependencies = new InstallationDependencies(context);

  context.subscriptions.push(storedTargetHighlighter(vscodeIDE, storedTargets));

  const vscodeTutorial = createTutorial(
    context,
    normalizedIde,
    scopeVisualizer,
    fileSystem,
    addCommandRunnerDecorator,
    hatTokenMap,
    customSpokenFormGenerator,
    hats,
  );

  registerCommands(
    context,
    vscodeIDE,
    commandApi,
    commandHistoryStorage,
    testCaseRecorder,
    scopeTestRecorder,
    scopeVisualizer,
    keyboardCommands,
    hats,
    vscodeTutorial,
    installationDependencies,
    storedTargets,
  );

  void new ReleaseNotes(vscodeApi, context, normalizedIde.messages).maybeShow();

  installationDependencies.maybeShow();

  return {
    testHelpers: isTesting
      ? constructTestHelpers(
          fakeCommandServerApi,
          storedTargets,
          hatTokenMap,
          vscodeIDE,
          normalizedIde as NormalizedIDE,
          fileSystem,
          scopeProvider,
          vscodeTutorial,
          injectIde,
          loadLanguage,
        )
      : undefined,
  };
}
