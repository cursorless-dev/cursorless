import {
  FakeIDE,
  getFakeCommandServerApi,
  isTesting,
  NormalizedIDE,
  Range,
  ScopeType,
  TextDocument,
} from "@cursorless/common";
import {
  createCursorlessEngine,
  ScopeVisualizer,
  ScopeVisualizerConfig,
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
import { VscodeIDE } from "./ide/vscode/VscodeIDE";
import { KeyboardCommands } from "./keyboard/KeyboardCommands";
import { registerCommands } from "./registerCommands";
import { StatusBarItem } from "./StatusBarItem";
import { VscodeScopeVisualizer } from "./ide/vscode/VSCodeScopeVisualizer";

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

  const { vscodeIDE, hats, vscodeScopeVisualizerFactory } =
    await createVscodeIde(context);

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
    scopeVisualizer: engineScopeVisualizer,
    snippets,
    injectIde,
    runIntegrationTests,
  } = createCursorlessEngine(
    treeSitter,
    normalizedIde ?? vscodeIDE,
    hats,
    commandServerApi,
  );

  const scopeVisualizer = new ScopeVisualizerImpl(
    vscodeScopeVisualizerFactory,
    engineScopeVisualizer,
  );

  const statusBarItem = StatusBarItem.create("cursorless.showQuickPick");
  const keyboardCommands = KeyboardCommands.create(context, statusBarItem);

  registerCommands(
    context,
    vscodeIDE,
    commandApi,
    testCaseRecorder,
    scopeVisualizer,
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
        )
      : undefined,

    experimental: {
      registerThirdPartySnippets: snippets.registerThirdPartySnippets,
    },
  };
}

type VisualizationType = "content" | "removal" | "iteration" | "every";

type VscodeScopeVisualizerFactory = (
  scopeType: ScopeType,
  visualizationType: VisualizationType,
) => VscodeScopeVisualizer;

class ScopeVisualizerImpl {
  private scopeVisualizer: VscodeScopeVisualizer | undefined;

  constructor(
    private readonly vscodeScopeVisualizerFactory: VscodeScopeVisualizerFactory,
    private engineScopeVisualizer: ScopeVisualizer,
  ) {}

  start(scopeType: ScopeType, visualizationType: VisualizationType) {
    this.stop();
    this.scopeVisualizer = this.vscodeScopeVisualizerFactory(
      scopeType,
      visualizationType,
    );
    let config: ScopeVisualizerConfig;
    switch (visualizationType) {
      case "content":
      case "removal":
        config = {
          scopeType,
          includeScopes: true,
          includeIterationScopes: false,
          includeIterationNestedTargets: false,
        };
        break;

      case "iteration":
      case "every":
        config = {
          scopeType,
          includeScopes: false,
          includeIterationScopes: true,
          includeIterationNestedTargets: visualizationType === "every",
        };
    }

    this.engineScopeVisualizer.start(this.scopeVisualizer);
  }

  stop() {
    this.engineScopeVisualizer.stop();
    this.scopeVisualizer?.dispose();
    this.scopeVisualizer = undefined;
  }
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

  return { vscodeIDE, hats, vscodeScopeVisualizerFactory };
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

// this method is called when your extension is deactivated
export function deactivate() {
  // do nothing
}
