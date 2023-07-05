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
import { constructTestHelpers } from "./constructTestHelpers";
import { FakeFontMeasurements } from "./ide/vscode/hats/FakeFontMeasurements";
import { FontMeasurementsImpl } from "./ide/vscode/hats/FontMeasurementsImpl";
import { VscodeHats } from "./ide/vscode/hats/VscodeHats";
import { VscodeIDE } from "./ide/vscode/VscodeIDE";
import { KeyboardCommands } from "./keyboard/KeyboardCommands";
import { registerCommands } from "./registerCommands";
import { StatusBarItem } from "./StatusBarItem";
import {
  createVscodeScopeVisualizer,
  VscodeScopeVisualizer,
} from "./ide/vscode/VSCodeScopeVisualizer";
import {
  ScopeVisualizerCommandApi,
  VisualizationType,
} from "./ScopeVisualizerCommandApi";
import { createVscodeApi } from "./createVscodeApi";
import { Vscode } from "@cursorless/vscode-common";
import { ExtensionContext, Location } from "vscode";

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

  const { vscodeIDE, hats } = await createVscodeIde(context);

  const normalizedIde =
    vscodeIDE.runMode === "production"
      ? undefined
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
    normalizedIde ?? vscodeIDE,
    hats,
    commandServerApi,
  );

  const statusBarItem = StatusBarItem.create("cursorless.showQuickPick");
  const keyboardCommands = KeyboardCommands.create(context, statusBarItem);
  const vscode = createVscodeApi();

  registerCommands(
    context,
    vscodeIDE,
    commandApi,
    testCaseRecorder,
    createScopeVisualizerCommandApi(
      vscode,
      normalizedIde ?? vscodeIDE,
      scopeProvider,
    ),
    keyboardCommands,
    hats,
  );

  return {
    testHelpers: isTesting()
      ? constructTestHelpers(
          commandServerApi,
          storedTargets,
          hatTokenMap,
          vscodeIDE,
          normalizedIde!,
          injectIde,
          runIntegrationTests,
          vscode,
        )
      : undefined,

    experimental: {
      registerThirdPartySnippets: snippets.registerThirdPartySnippets,
    },
  };
}

async function createVscodeIde(context: ExtensionContext) {
  const vscodeIDE = new VscodeIDE(context);

  const hats = new VscodeHats(
    vscodeIDE,
    context,
    vscodeIDE.runMode === "test"
      ? new FakeFontMeasurements()
      : new FontMeasurementsImpl(context),
  );
  await hats.init();

  return { vscodeIDE, hats };
}

function createTreeSitter(parseTreeApi: ParseTreeApi): TreeSitter {
  return {
    getNodeAtLocation(document: TextDocument, range: Range) {
      return parseTreeApi.getNodeAtLocation(
        new Location(document.uri, toVscodeRange(range)),
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
  vscode: Vscode,
  ide: IDE,
  scopeProvider: ScopeProvider,
): ScopeVisualizerCommandApi {
  let scopeVisualizer: VscodeScopeVisualizer | undefined;

  return {
    start(scopeType: ScopeType, visualizationType: VisualizationType) {
      scopeVisualizer?.dispose();
      scopeVisualizer = createVscodeScopeVisualizer(
        vscode,
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
