import {
  FakeIDE,
  getFakeCommandServerApi,
  IDE,
  isTesting,
  NormalizedIDE,
  Range,
  ScopeType,
  TextDocument,
} from "@cursorless/common";
import {
  createCursorlessEngine,
  ScopeProvider,
  TreeSitter,
} from "@cursorless/cursorless-engine";
import {
  CursorlessApi,
  getCommandServerApi,
  getParseTreeApi,
  ParseTreeApi,
  toVscodeRange,
} from "@cursorless/vscode-common";
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
import {
  ScopeVisualizerCommandApi,
  VisualizationType,
} from "./ScopeVisualizerCommandApi";
import { StatusBarItem } from "./StatusBarItem";
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
        );

  const commandServerApi =
    vscodeIDE.runMode === "test"
      ? getFakeCommandServerApi()
      : await getCommandServerApi();

  const treeSitter: TreeSitter = createTreeSitter(parseTreeApi);

  const {
    commandApi,
    testCaseRecorder,
    storedTargets,
    hatTokenMap,
    scopeProvider,
    snippets,
    injectIde,
    runIntegrationTests,
  } = createCursorlessEngine(
    treeSitter,
    normalizedIde,
    hats,
    commandServerApi,
    fileSystem,
  );

  const statusBarItem = StatusBarItem.create("cursorless.showQuickPick");
  const keyboardCommands = KeyboardCommands.create(context, statusBarItem);

  registerCommands(
    context,
    vscodeIDE,
    commandApi,
    testCaseRecorder,
    createScopeVisualizerCommandApi(normalizedIde, scopeProvider),
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
    context,
    vscodeIDE.runMode === "test"
      ? new FakeFontMeasurements()
      : new FontMeasurementsImpl(context),
  );
  await hats.init();

  return { vscodeIDE, hats, fileSystem: new VscodeFileSystem() };
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

function createScopeVisualizerCommandApi(
  ide: IDE,
  scopeProvider: ScopeProvider,
): ScopeVisualizerCommandApi {
  let scopeVisualizer: VscodeScopeVisualizer | undefined;

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
    },

    stop() {
      scopeVisualizer?.dispose();
      scopeVisualizer = undefined;
    },
  };
}

// this method is called when your extension is deactivated
export function deactivate() {
  // do nothing
}
