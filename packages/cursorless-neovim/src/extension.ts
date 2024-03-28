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
import { NeovimHats } from "./ide/neovim/hats/NeovimHats";
import { NeovimFileSystem } from "./ide/neovim/NeovimFileSystem";
import { NeovimIDE } from "./ide/neovim/NeovimIDE";
import { Language, SyntaxNode, Tree } from "web-tree-sitter";
import { injectCommandApi } from "./singletons/cmdapi.singleton";
import { NeovimCommandServerApi } from "./NeovimCommandServerApi";
import { constructTestHelpers } from "./constructTestHelpers";
import { injectCursorlessApi } from "./singletons/cursorlessapi.singleton";
import { runRecordedTestCases } from "./suite/recorded.vscode.test";
import { NvimPlugin } from "neovim/lib/host/NvimPlugin";
import { NeovimClient } from "neovim/lib/api/client";
import { injectClient } from "./singletons/client.singleton";

/**
 * This function is called from talon.nvim to initialize the Cursorless engine.
 * NOTE: this is not the cursorless-neovim extension entrypoint (which is called at Neovim startup)
 * We named it activate() in order to have the same structure as the extension entrypoint to match cursorless-vscode
 */
export async function activate(plugin: NvimPlugin) {
  // debugger;
  const client = plugin.nvim as NeovimClient;
  injectClient(client);
  const buffer = await client.buffer;

  const { neovimIDE, hats, fileSystem } = await createNeovimIde(client);

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

  const treeSitter: TreeSitter = createTreeSitter();

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
  } = await createCursorlessEngine(
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

  // COMMENT ME IF YOU DON'T WANT TO RUN TESTS
  // console.warn("activate(): running the recorded test cases...");
  // await runRecordedTestCases();
  // console.warn("activate(): recorded test cases done");
  // COMMENT ME END
}

async function createNeovimIde(client: NeovimClient) {
  const neovimIDE = new NeovimIDE(client);
  await neovimIDE.init();

  const hats = new NeovimHats(neovimIDE);
  await hats.init();

  // FIXME: Inject this from test harness. Would need to arrange to delay
  // extension initialization, probably by returning a function from extension
  // init that has parameters consisting of test configuration, and have that
  // function do the actual initialization.
  const cursorlessDir = isTesting()
    ? path.join(os.tmpdir(), crypto.randomBytes(16).toString("hex"))
    : path.join(os.homedir(), ".cursorless");

  const fileSystem = new NeovimFileSystem(
    neovimIDE.runMode,
    cursorlessDir,
  );
  await fileSystem.initialize();

  return { neovimIDE, hats, fileSystem };
}

// We don't need a parse tree for now, so just building a fake/empty one
function createTreeSitter(): TreeSitter {
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
