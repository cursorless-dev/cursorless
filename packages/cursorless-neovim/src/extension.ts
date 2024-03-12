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
import * as crypto from "crypto";
import * as os from "os";
import * as path from "path";
import { ExtensionContext } from "./types/ExtensionContext";
import { NeovimExtensionContext } from "./ide/neovim/NeovimExtensionContext";
import { NeovimHats } from "./ide/neovim/hats/NeovimHats";
import { NeovimFileSystem } from "./ide/neovim/NeovimFileSystem";
import { NeovimIDE } from "./ide/neovim/NeovimIDE";
import { Language, SyntaxNode, Tree } from "web-tree-sitter";
import { BufferManager, receivedBufferEvent } from "./types/BufferManager";
import { injectBufferManager } from "./singletons/bufmgr.singleton";
import { NeovimTextDocumentImpl } from "./ide/neovim/NeovimTextDocumentImpl";
import { injectCommandApi } from "./singletons/cmdapi.singleton";

// import { callbackify } from "node:util";
// import * as deasync from "deasync";

// function awaitSync<T>(promise: Promise<T>): T {
//   return deasync(callbackify(() => promise))();
// }

// function asyncFn(
//   p: string,
//   cb: { (err: any, res: any): void; (arg0: null, arg1: string): any },
// ) {
//   const res = "hello " + p;
//   const err = null;
//   return cb && cb(err, res);
// }
// import { deasync } from "@kaciras/deasync";
import { deasync } from "@kaciras/deasync";

const sleep = deasync((timeout: number, callback: any) => {
  setTimeout(() => callback(null, "wake up!"), timeout);
});

/**
 * Simulates the extension entrypoint to match cursorless-vscode
 */
export async function activate(context: NeovimExtensionContext) {
  // debugger; // NOTE: helps debugging

  const client = context.client;

  const bufmgr = new BufferManager(context);
  injectBufferManager(bufmgr);

  const lines1 = await client.buffer.lines;
  const lines2 = client.buffer.lines;
  // const lines = awaitSync(client.buffer.lines);
  // const lines3 = deasync(callbackify(() => client.buffer.lines);
  console.warn("Timestamp before: " + performance.now());
  console.warn(sleep(1000));
  console.warn("Timestamp after: " + performance.now());

  // /** Use as async */
  // asyncFn("async world", (err: any, res: any) => {
  //   console.warn("asyncFn callback:", res);
  // });

  // /** Use as sync! */
  // const syncFn = deasync(asyncFn);
  // const result = syncFn("sync world");
  // console.log("syncFn result:", result);

  // TODO: we should be able to get the parsetree api directly from neovim
  // const parseTreeApi = await getParseTreeApi();

  const { neovimIDE, hats, fileSystem } = await createNeovimIde(context);

  // Hack for now
  // We only initialize one editor(current window) with existing documents(open files i.e. buffers)
  // TODO: we need to support updating editors and documents on the fly

  // initialize the editor
  neovimIDE.fromNeovimEditor(await client.window);

  // initialize the documents
  const buffers = await client.buffers;
  buffers.forEach((buf) => {
    console.warn("creating document for buffer: ", buf.id);
    const document = new NeovimTextDocumentImpl(buf);
    bufmgr.textDocumentToBufferId.set(document, buf.id);
  });

  /**
   * "attach" to Nvim buffers to subscribe to buffer update events.
   * This is similar to TextChanged but more powerful and granular.
   *
   * @see https://neovim.io/doc/user/api.html#nvim_buf_attach()
   */
  buffers.forEach(
    /* async */ (buf) => {
      console.warn("listening for changes in buffer: ", buf.id);
      buf.listen("lines", receivedBufferEvent);
      // TODO: Exception has occurred: TypeError: buf[import_Buffer.ATTACH] is not a function
      // await buf[ATTACH](true);
    },
  );

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
  injectCommandApi(commandApi);
  // debugger; // NOTE: helps debugging
  console.warn("activate(): Cursorless extension loaded");
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
      return null as unknown as SyntaxNode; // TODO: update
    },

    getTree(document: TextDocument) {
      return null as unknown as Tree; // TODO: update
    },

    loadLanguage(languageId: string) {
      return Promise.resolve(false); // TODO: update
    },
    getLanguage(languageId: string): Language | undefined {
      return undefined; // TODO: update
    },
  };
}
