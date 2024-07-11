import {
  Disposable,
  FakeCommandServerApi,
  FakeIDE,
  IDE,
  isTesting,
  NormalizedIDE,
  Range,
  ScopeProvider,
  ScopeType,
  TextDocument,
} from "@cursorless/common";
import {
  CommandHistory,
  createCursorlessEngine,
  ScopeTestRecorder,
  TestCaseRecorder,
  TreeSitter,
} from "@cursorless/cursorless-engine";
import {
  FileSystemCommandHistoryStorage,
  FileSystemLanguageDefinitionsProvider,
  FileSystemTalonSpokenForms,
} from "@cursorless/file-system-common";
import {
  CursorlessApi,
  getCommandServerApi,
  getParseTreeApi,
  ParseTreeApi,
  toVscodeRange,
} from "@cursorless/vscode-common";
import * as crypto from "crypto";
import * as os from "os";
import * as path from "pathe";
import * as vscode from "vscode";
import { constructTestHelpers } from "./constructTestHelpers";
import { FakeFontMeasurements } from "./ide/vscode/hats/FakeFontMeasurements";
import { FontMeasurementsImpl } from "./ide/vscode/hats/FontMeasurementsImpl";
import { VscodeHats } from "./ide/vscode/hats/VscodeHats";
import { VscodeFileSystem } from "./ide/vscode/VscodeFileSystem";
import { VscodeIDE } from "./ide/vscode/VscodeIDE";
import {
  createVscodeScopeVisualizer,
  VscodeScopeVisualizer,
} from "./ide/vscode/VSCodeScopeVisualizer";
import { KeyboardCommands } from "./keyboard/KeyboardCommands";
import { registerCommands } from "./registerCommands";
import { ReleaseNotes } from "./ReleaseNotes";
import { revisualizeOnCustomRegexChange } from "./revisualizeOnCustomRegexChange";
import { ScopeTreeProvider } from "./ScopeTreeProvider";
import {
  ScopeVisualizer,
  ScopeVisualizerListener,
  VisualizationType,
} from "./ScopeVisualizerCommandApi";
import { StatusBarItem } from "./StatusBarItem";
import { storedTargetHighlighter } from "./storedTargetHighlighter";
import { vscodeApi } from "./vscodeApi";
import { VscodeSnippets } from "./VscodeSnippets";

/**
 * Extension entrypoint called by VSCode on Cursorless startup.
 * - Creates a dependency container {@link Graph} with the components that
 * implement Cursorless.
 * - Creates test case recorder {@link TestCaseRecorder} for contributors to
 * use to record test cases.
 * - Creates an entrypoint for running commands {@link CommandRunner}.
 */
export async function activate(
  context: vscode.ExtensionContext,
): Promise<CursorlessApi> {
  const parseTreeApi = await getParseTreeApi();

  const { vscodeIDE, hats, fileSystem } = await createVscodeIde(context);

  const normalizedIde =
    vscodeIDE.runMode === "production"
      ? vscodeIDE
      : new NormalizedIDE(
          vscodeIDE,
          new FakeIDE(),
          vscodeIDE.runMode === "test",
        );

  const fakeCommandServerApi = new FakeCommandServerApi();
  const commandServerApi = isTesting()
    ? fakeCommandServerApi
    : await getCommandServerApi();

  const treeSitter = createTreeSitter(parseTreeApi);
  const talonSpokenForms = new FileSystemTalonSpokenForms(fileSystem);
  const languageDefinitionsProvider = new FileSystemLanguageDefinitionsProvider(
    normalizedIde,
    fileSystem,
  );

  const snippets = new VscodeSnippets(normalizedIde);
  void snippets.init();

  const {
    commandApi,
    storedTargets,
    hatTokenMap,
    scopeProvider,
    injectIde,
    runIntegrationTests,
    addCommandRunnerDecorator,
    customSpokenFormGenerator,
  } = await createCursorlessEngine({
    ide: normalizedIde,
    treeSitter,
    hats,
    commandServerApi,
    talonSpokenForms,
    snippets,
    languageDefinitionsProvider,
  });

  const commandHistoryStorage = new FileSystemCommandHistoryStorage(
    fileSystem.cursorlessCommandHistoryDirPath,
  );

  addCommandRunnerDecorator(
    new CommandHistory(normalizedIde, commandHistoryStorage, commandServerApi),
  );

  const testCaseRecorder = new TestCaseRecorder(
    commandServerApi,
    hatTokenMap,
    storedTargets,
  );
  addCommandRunnerDecorator(testCaseRecorder);

  const scopeTestRecorder = new ScopeTestRecorder(normalizedIde);

  const statusBarItem = StatusBarItem.create("cursorless.showQuickPick");
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
    vscodeApi,
    context,
    scopeProvider,
    scopeVisualizer,
    customSpokenFormGenerator,
    commandServerApi != null,
  );

  context.subscriptions.push(storedTargetHighlighter(vscodeIDE, storedTargets));

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
    storedTargets,
  );

  new ReleaseNotes(vscodeApi, context, normalizedIde.messages).maybeShow();

  return {
    testHelpers: isTesting()
      ? constructTestHelpers(
          fakeCommandServerApi,
          storedTargets,
          hatTokenMap,
          vscodeIDE,
          normalizedIde as NormalizedIDE,
          fileSystem,
          scopeProvider,
          injectIde,
          runIntegrationTests,
        )
      : undefined,

    experimental: {
      registerThirdPartySnippets: snippets.registerThirdPartySnippets,
    },
  };
}

async function createVscodeIde(context: vscode.ExtensionContext) {
  const vscodeIDE = new VscodeIDE(context);

  const hats = new VscodeHats(
    vscodeIDE,
    vscodeApi,
    context,
    vscodeIDE.runMode === "test"
      ? new FakeFontMeasurements()
      : new FontMeasurementsImpl(context),
  );
  await hats.init();

  // FIXME: Inject this from test harness. Would need to arrange to delay
  // extension initialization, probably by returning a function from extension
  // init that has parameters consisting of test configuration, and have that
  // function do the actual initialization.
  const cursorlessDir = isTesting()
    ? path.join(os.tmpdir(), crypto.randomBytes(16).toString("hex"))
    : path.join(os.homedir(), ".cursorless");

  const fileSystem = new VscodeFileSystem(
    context,
    vscodeIDE.runMode,
    cursorlessDir,
  );
  await fileSystem.initialize();

  return { vscodeIDE, hats, fileSystem };
}

function createTreeSitter(parseTreeApi: ParseTreeApi): TreeSitter {
  return {
    getNodeAtLocation(document: TextDocument, range: Range) {
      return parseTreeApi.getNodeAtLocation(
        new vscode.Location(document.uri, toVscodeRange(range)),
      );
    },

    getTree(document: TextDocument) {
      return parseTreeApi.getTreeForUri(document.uri);
    },

    loadLanguage: parseTreeApi.loadLanguage,
    getLanguage: parseTreeApi.getLanguage,
  };
}

function createScopeVisualizer(
  ide: IDE,
  scopeProvider: ScopeProvider,
): ScopeVisualizer {
  let scopeVisualizer: VscodeScopeVisualizer | undefined;
  let currentScopeType: ScopeType | undefined;

  const listeners: ScopeVisualizerListener[] = [];

  return {
    start(scopeType: ScopeType, visualizationType: VisualizationType) {
      scopeVisualizer?.dispose();
      scopeVisualizer = createVscodeScopeVisualizer(
        ide,
        scopeProvider,
        scopeType,
        visualizationType,
      );
      scopeVisualizer.start();
      currentScopeType = scopeType;
      listeners.forEach((listener) => listener(scopeType, visualizationType));
    },

    stop() {
      scopeVisualizer?.dispose();
      scopeVisualizer = undefined;
      currentScopeType = undefined;
      listeners.forEach((listener) => listener(undefined, undefined));
    },

    get scopeType() {
      return currentScopeType;
    },

    onDidChangeScopeType(listener: ScopeVisualizerListener): Disposable {
      listeners.push(listener);

      return {
        dispose() {
          listeners.splice(listeners.indexOf(listener), 1);
        },
      };
    },
  };
}

// this method is called when your extension is deactivated
export function deactivate() {
  // do nothing
}
