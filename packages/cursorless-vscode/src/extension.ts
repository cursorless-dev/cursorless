import {
  Disposable,
  FakeIDE,
  getFakeCommandServerApi,
  getLanguageScopeSupport,
  IDE,
  isTesting,
  NormalizedIDE,
  Range,
  ScopeProvider,
  ScopeType,
  TextDocument,
} from "@cursorless/common";
import {
  createCursorlessEngine,
  TreeSitter,
} from "@cursorless/cursorless-engine";
import {
  CursorlessApi,
  getCommandServerApi,
  getParseTreeApi,
  ParseTreeApi,
  toVscodeRange,
} from "@cursorless/vscode-common";
import * as crypto from "crypto";
import * as os from "os";
import * as path from "path";
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
import { vscodeApi } from "./vscodeApi";
import { mkdir } from "fs/promises";
import { TestCaseRecorder } from "@cursorless/cursorless-engine";

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

  const commandServerApi =
    vscodeIDE.runMode === "test"
      ? getFakeCommandServerApi()
      : await getCommandServerApi();

  const treeSitter: TreeSitter = createTreeSitter(parseTreeApi);

  const {
    commandApi,
    storedTargets,
    hatTokenMap,
    scopeProvider,
    snippets,
    injectIde,
    runIntegrationTests,
    addCommandRunnerDecorator,
    customSpokenFormGenerator,
  } = createCursorlessEngine(
    treeSitter,
    normalizedIde,
    hats,
    commandServerApi,
    fileSystem,
  );

  const testCaseRecorder = new TestCaseRecorder(hatTokenMap, storedTargets);
  addCommandRunnerDecorator(testCaseRecorder);

  const statusBarItem = StatusBarItem.create("cursorless.showQuickPick");
  const keyboardCommands = KeyboardCommands.create(context, statusBarItem);
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

  registerCommands(
    context,
    vscodeIDE,
    commandApi,
    testCaseRecorder,
    scopeVisualizer,
    keyboardCommands,
    hats,
  );

  new ReleaseNotes(vscodeApi, context, normalizedIde.messages).maybeShow();

  return {
    testHelpers: isTesting()
      ? constructTestHelpers(
          commandServerApi,
          storedTargets,
          hatTokenMap,
          vscodeIDE,
          normalizedIde as NormalizedIDE,
          fileSystem.cursorlessTalonStateJsonPath,
          scopeProvider,
          injectIde,
          runIntegrationTests,
          getLanguageScopeSupport,
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
  await mkdir(cursorlessDir, { recursive: true });

  return { vscodeIDE, hats, fileSystem: new VscodeFileSystem(cursorlessDir) };
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
