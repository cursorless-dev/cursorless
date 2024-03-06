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
import { ExtensionContext } from "./types/ExtensionContext";
import { NeovimExtensionContext } from "./ide/neovim/NeovimExtensionContext";
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
// import { NeovimClient, NvimPlugin } from "neovim";

export async function activate(context: NeovimExtensionContext) {
  debugger;

  // TODO: any access to "client" crashes neovim after a short time
  // https://github.com/neovim/neovim/issues/23781

  const client = context.client; // NeovimClient
  // const parseTreeApi = await getParseTreeApi();

  // try {
  // const message = await client.request("nvim_buf_attach", [
  //   0,
  //   true,
  //   {
  //     on_lines: () => {
  //       console.warn("on_lines");
  //     },
  //   },
  // ]);
  const buf = await client.buffer;
  buf.listen("lines", receivedBufferEvent);
  const ret = client.isApiReady;
  console.warn("isApiReady ", ret); // true
  // const ret = await client.request("nvim_set_current_line", ["hello world"]);
  // console.warn("request ", ret);
  // const type = await client.request("nvim_buf_get_option", [
  //   buf.id,
  //   "filetype",
  // ]);
  //   console.warn("request success", type); // "python" if test.py is open
  // } catch (error) {
  //   console.warn("request failed", error);
  // }
  // const window = await client.window;
  // console.warn("window ", window);
  // const lines = (await client.buffer).lines;
  // console.warn("lines ", lines);

  const { neovimIDE, hats, fileSystem } = await createNeovimIde(context);

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

  // const {
  //   commandApi,
  //   storedTargets,
  //   hatTokenMap,
  //   scopeProvider,
  //   snippets,
  //   injectIde,
  //   runIntegrationTests,
  //   addCommandRunnerDecorator,
  //   customSpokenFormGenerator,
  // } = createCursorlessEngine(
  //   treeSitter,
  //   normalizedIde,
  //   hats,
  //   commandServerApi,
  //   fileSystem,
  // );
  debugger;
}

function receivedBufferEvent(
  buffer: Buffer,
  tick: number,
  firstLine: number,
  lastLine: number,
  linedata: string[],
  more: boolean,
): void {
  console.warn(
    `receivedBufferEvent(): buffer=${buffer}, tick=${tick}, firstLine=${firstLine}, lastLine-1=${
      lastLine - 1
    }, linedata=${linedata}, more=${more}`,
  );
}

async function createNeovimIde(context: ExtensionContext) {
  const neovimIDE = new NeovimIDE(context);

  const hats = new NeovimHats(neovimIDE, context);
  await hats.init();

  // FIXME: Inject this from test harness. Would need to arrange to delay
  // extension initialization, probably by returning a function from extension
  // init that has parameters consisting of test configuration, and have that
  // function do the actual initialization.
  const cursorlessDir = isTesting()
    ? path.join(os.tmpdir(), crypto.randomBytes(16).toString("hex"))
    : path.join(os.homedir(), ".cursorless");

  const fileSystem = new NeovimFileSystem(
    context,
    neovimIDE.runMode,
    cursorlessDir,
  );
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
