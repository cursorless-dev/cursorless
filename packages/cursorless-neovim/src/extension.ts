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
import { BufferManager } from "./types/BufferManager";
import { injectBufferManager } from "./singletons/bufmgr.singleton";
import { NeovimTextDocumentImpl } from "./ide/neovim/NeovimTextDocumentImpl";
// import { EventEmitter } from "node:events";
// import { NeovimClient, NvimPlugin } from "neovim";

export async function activate(context: NeovimExtensionContext) {
  debugger;

  const client = context.client;

  const bufferManager = new BufferManager(context);
  injectBufferManager(bufferManager);

  /**
   * "attach" to Nvim buffers to subscribe to buffer update events.
   * This is similar to TextChanged but more powerful and granular.
   *
   * @see https://neovim.io/doc/user/api.html#nvim_buf_attach()
   */
  const buffers = await client.buffers;
  buffers.forEach((buf) => {
    console.warn("creating document for buffer: ", buf.id);
    // const uri = bufferManager.buildExternalBufferUri("changeme", buf.id);
    const document = new NeovimTextDocumentImpl(buf);
    bufferManager.externalTextDocuments.add(document);
    console.warn("listening for changes in buffer: ", buf.id);
    buf.listen("lines", bufferManager.receivedBufferEvent);
  });

  // const myEmitter = new EventEmitter();

  // // First listener
  // myEmitter.on("event", function firstListener() {
  //   console.warn("Helloooo! first listener");
  // });
  // // Second listener
  // myEmitter.on("event", function secondListener(arg1, arg2) {
  //   console.warn(`event with parameters ${arg1}, ${arg2} in second listener`);
  // });
  // // Third listener
  // myEmitter.on("event", function thirdListener(...args) {
  //   const parameters = args.join(", ");
  //   console.warn(`event with parameters ${parameters} in third listener`);
  // });

  // console.warn(myEmitter.listeners("event"));

  // myEmitter.emit("event", 1, 2, 3, 4, 5);

  // const parseTreeApi = await getParseTreeApi();

  // try {
  // const buf = await client.buffer;
  // const ret = client.isApiReady;
  // console.warn("isApiReady ", ret); // true
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
