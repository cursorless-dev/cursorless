import {
  Disposable,
  EnforceUndefined,
  FakeCommandServerApi,
  FakeIDE,
  HatTokenMap,
  IDE,
  NormalizedIDE,
  Range,
  ScopeProvider,
  ScopeType,
  TextDocument,
  type TreeSitter,
} from "@cursorless/common";
import {
  CommandHistory,
  CommandRunnerDecorator,
  CustomSpokenFormGenerator,
  EngineProps,
  createCursorlessEngine,
} from "@cursorless/cursorless-engine";
import { TutorialImpl } from "@cursorless/cursorless-tutorial";
import {
  FileSystemCommandHistoryStorage,
  FileSystemRawTreeSitterQueryProvider,
  FileSystemTalonSpokenForms,
  FileSystemTutorialContentProvider,
  getFixturePath,
} from "@cursorless/node-common";
import {
  ScopeTestRecorder,
  TestCaseRecorder,
} from "@cursorless/test-case-recorder";
import {
  CursorlessApi,
  ParseTreeApi,
  getCommandServerApi,
  getParseTreeApi,
  toVscodeRange,
} from "@cursorless/vscode-common";
import * as crypto from "crypto";
import * as os from "node:os";
import * as path from "node:path";
import * as vscode from "vscode";
import { ReleaseNotes } from "./ReleaseNotes";
import { ScopeTreeProvider } from "./ScopeTreeProvider";
import {
  ScopeVisualizer,
  ScopeVisualizerListener,
  VisualizationType,
} from "./ScopeVisualizerCommandApi";
import { StatusBarItem } from "./StatusBarItem";
import { VscodeSnippets } from "./VscodeSnippets";
import { VscodeTutorial } from "./VscodeTutorial";
import { constructTestHelpers } from "./constructTestHelpers";
import {
  VscodeScopeVisualizer,
  createVscodeScopeVisualizer,
} from "./ide/vscode/VSCodeScopeVisualizer";
import { VscodeFileSystem } from "./ide/vscode/VscodeFileSystem";
import { VscodeIDE } from "./ide/vscode/VscodeIDE";
import { FakeFontMeasurements } from "./ide/vscode/hats/FakeFontMeasurements";
import { FontMeasurementsImpl } from "./ide/vscode/hats/FontMeasurementsImpl";
import { VscodeHats } from "./ide/vscode/hats/VscodeHats";
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
          getFixturePath("cursorless-snippets"),
        );

  const fakeCommandServerApi = new FakeCommandServerApi();
  const commandServerApi =
    normalizedIde.runMode === "test"
      ? fakeCommandServerApi
      : await getCommandServerApi();

  const treeSitter = createTreeSitter(parseTreeApi);
  const talonSpokenForms = new FileSystemTalonSpokenForms(fileSystem);

  const snippets = new VscodeSnippets(normalizedIde);
  void snippets.init();

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
    runIntegrationTests,
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

  const vscodeTutorial = createTutorial(
    context,
    normalizedIde,
    scopeVisualizer,
    fileSystem,
    addCommandRunnerDecorator,
    hatTokenMap,
    customSpokenFormGenerator,
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
    storedTargets,
  );

  new ReleaseNotes(vscodeApi, context, normalizedIde.messages).maybeShow();

  return {
    testHelpers:
      normalizedIde.runMode === "test"
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
            vscodeTutorial,
          )
        : undefined,

    experimental: {
      registerThirdPartySnippets: snippets.registerThirdPartySnippets,
    },
  };
}

function createTutorial(
  context: vscode.ExtensionContext,
  ide: IDE,
  scopeVisualizer: ScopeVisualizer,
  fileSystem: VscodeFileSystem,
  addCommandRunnerDecorator: (
    commandRunnerDecorator: CommandRunnerDecorator,
  ) => void,
  hatTokenMap: HatTokenMap,
  customSpokenFormGenerator: CustomSpokenFormGenerator,
) {
  const contentProvider = new FileSystemTutorialContentProvider(ide.assetsRoot);

  const tutorial = new TutorialImpl(
    ide,
    hatTokenMap,
    customSpokenFormGenerator,
    contentProvider,
  );
  ide.disposeOnExit(tutorial);
  addCommandRunnerDecorator(tutorial);

  return new VscodeTutorial(
    context,
    vscodeApi,
    tutorial,
    scopeVisualizer,
    fileSystem,
  );
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
  const cursorlessDir =
    vscodeIDE.runMode === "test"
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
