import {
  FakeIDE,
  getFakeCommandServerApi,
  isTesting,
  NormalizedIDE,
  Range,
  TextDocument,
} from "@cursorless/common";
import {
  createCursorlessEngine,
  TreeSitter,
} from "@cursorless/cursorless-engine";
// import {
//   CursorlessApi,
//   getCommandServerApi,
//   getParseTreeApi,
//   ParseTreeApi,
//   toVscodeRange,
// } from "@cursorless/vscode-common";
import * as crypto from "crypto";
import * as os from "os";
import * as path from "path";
// import { constructTestHelpers } from "./constructTestHelpers";
// import { FakeFontMeasurements } from "./ide/vscode/hats/FakeFontMeasurements";
// import { FontMeasurementsImpl } from "./ide/vscode/hats/FontMeasurementsImpl";
import { NeovimHats } from "./ide/neovim/hats/NeovimHats";
import { NeovimFileSystem } from "./ide/neovim/NeovimFileSystem";
import { NeovimIDE } from "./ide/neovim/NeovimIDE";
// import {
//   createVscodeScopeVisualizer,
//   VscodeScopeVisualizer,
// } from "./ide/vscode/VSCodeScopeVisualizer";
// import { KeyboardCommands } from "./keyboard/KeyboardCommands";
// import { registerCommands } from "./registerCommands";
// import { ReleaseNotes } from "./ReleaseNotes";
// import { revisualizeOnCustomRegexChange } from "./revisualizeOnCustomRegexChange";
// import { ScopeTreeProvider } from "./ScopeTreeProvider";
// import {
//   ScopeVisualizer,
//   ScopeVisualizerListener,
//   VisualizationType,
// } from "./ScopeVisualizerCommandApi";
// import { StatusBarItem } from "./StatusBarItem";
// import { vscodeApi } from "./vscodeApi";
// import { storedTargetHighlighter } from "./storedTargetHighlighter";
import { Language, SyntaxNode, Tree } from "web-tree-sitter";
import { NvimPlugin } from "neovim";

// TODO: move to extension.ts? and pass a neovimPlugin object?
export async function activate(plugin: NvimPlugin) {
  debugger;

  const client = plugin.nvim; // NeovimClient
  // const parseTreeApi = await getParseTreeApi();

  const { neovimIDE, hats, fileSystem } = await createNeovimIde();

  const normalizedIde =
    neovimIDE.runMode === "production"
      ? neovimIDE
      : new NormalizedIDE(
          neovimIDE,
          new FakeIDE(),
          neovimIDE.runMode === "test",
        );

  // const commandServerApi =
  // vscodeIDE.runMode === "test"
  //   ? getFakeCommandServerApi()
  //   : await getCommandServerApi();
  const commandServerApi = getFakeCommandServerApi();

  const treeSitter: TreeSitter = createTreeSitter(/* parseTreeApi */);

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
  debugger;
}

async function createNeovimIde() {
  const neovimIDE = new NeovimIDE();

  const hats = new NeovimHats(neovimIDE);
  await hats.init();

  // FIXME: Inject this from test harness. Would need to arrange to delay
  // extension initialization, probably by returning a function from extension
  // init that has parameters consisting of test configuration, and have that
  // function do the actual initialization.
  const cursorlessDir = isTesting()
    ? path.join(os.tmpdir(), crypto.randomBytes(16).toString("hex"))
    : path.join(os.homedir(), ".cursorless");

  const fileSystem = new NeovimFileSystem(neovimIDE.runMode, cursorlessDir);
  await fileSystem.initialize();

  return { neovimIDE, hats, fileSystem };
}

function createTreeSitter(/* parseTreeApi: ParseTreeApi */): TreeSitter {
  return {
    getNodeAtLocation(document: TextDocument, range: Range) {
      return null as unknown as SyntaxNode;
    },

    getTree(document: TextDocument) {
      return null as unknown as Tree;
    },

    loadLanguage(languageId: string) {
      return Promise.resolve(false);
    },
    getLanguage(languageId: string): Language | undefined {
      return undefined;
    },
  };
}
