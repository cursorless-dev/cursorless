import {
  FakeCommandServerApi,
  FakeIDE,
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
import { BufferManager } from "./types/BufferManager";
import { injectBufferManager } from "./singletons/bufmgr.singleton";
import { injectCommandApi } from "./singletons/cmdapi.singleton";
import { injectIde as injectIde2 } from "./singletons/ide.singleton";
import { NeovimCommandServerApi } from "./NeovimCommandServerApi";
import { constructTestHelpers } from "./constructTestHelpers";
import { injectCursorlessApi } from "./singletons/cursorlessapi.singleton";
import { runRecordedTestCases } from "./suite/recorded.vscode.test";

/**
 * This function is called from talon.nvim to initialize the Cursorless engine.
 * NOTE: this is not the cursorless-neovim extension entrypoint (which is called at Neovim startup)
 * We named it activate() in order to have the same structure as the extension entrypoint to match cursorless-vscode
 */
export async function activate(context: NeovimExtensionContext) {
  debugger;
  const client = context.client;
  const buffer = await client.buffer;

  const bufmgr = new BufferManager(context);
  injectBufferManager(bufmgr);

  // TODO: we should be able to get the parsetree api directly from neovim
  // const parseTreeApi = await getParseTreeApi();

  const { neovimIDE, hats, fileSystem } = await createNeovimIde(context);
  injectIde2(neovimIDE); // TODO: this is duplicating what Cursorless engine does but for NeovimIDE

  //await subscribeBufferUpdates();

  const normalizedIde =
    neovimIDE.runMode === "production"
      ? neovimIDE
      : new NormalizedIDE(
          neovimIDE,
          new FakeIDE(),
          neovimIDE.runMode === "test",
        );

  const fakeCommandServerApi = new FakeCommandServerApi();
  const neovimCommandServerApi = new NeovimCommandServerApi(client);
  const commandServerApi = isTesting()
    ? fakeCommandServerApi
    : neovimCommandServerApi;

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

  // set CURSORLESS_TEST = 1 for testing
  const cursorlessApi = {
    testHelpers: isTesting()
      ? constructTestHelpers(
          fakeCommandServerApi,
          storedTargets,
          hatTokenMap,
          neovimIDE,
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
  injectCursorlessApi(cursorlessApi);

  console.warn("activate(): Cursorless extension loaded");

  console.warn("activate(): running the recorded test cases...");
  await runRecordedTestCases();
  console.warn("activate(): recorded test cases done");
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
