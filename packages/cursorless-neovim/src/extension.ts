import {
  FakeCommandServerApi,
  FakeIDE,
  NormalizedIDE,
  Range,
  TextDocument,
} from "@cursorless/common";
import {
  TreeSitter,
  createCursorlessEngine,
} from "@cursorless/cursorless-engine";
import {
  EXTENSION_ID,
  NeovimFileSystem,
  NeovimHats,
  NeovimIDE,
} from "@cursorless/neovim-common";
import { getNeovimRegistry } from "@cursorless/neovim-registry";
import * as crypto from "crypto";
import type { NeovimClient } from "neovim/lib/api/client";
import type { NvimPlugin } from "neovim/lib/host/NvimPlugin";
import * as os from "os";
import * as path from "path";
import { Language, Tree } from "web-tree-sitter";
import { NeovimCommandServerApi } from "./NeovimCommandServerApi";
import { constructTestHelpers } from "./constructTestHelpers";
import { registerCommands } from "./registerCommands";

/**
 * This function is called from cursorless.nvim to initialize the Cursorless engine.
 * NOTE: this is not the cursorless-neovim extension entrypoint (which is called at Neovim startup)
 * We named it activate() in order to have the same structure as the extension entrypoint to match cursorless-vscode
 */
export async function activate(plugin: NvimPlugin) {
  const client = plugin.nvim as NeovimClient;

  const { neovimIDE, hats, fileSystem } = await createNeovimIde(client);

  const normalizedIde =
    neovimIDE.runMode === "production"
      ? neovimIDE
      : new NormalizedIDE(
          neovimIDE,
          new FakeIDE(),
          neovimIDE.runMode === "test",
        );

  // TODO: atm if we are using testing, the focused element will always be the texteditor
  // even if we the current window is a terminal. We need to fix this.
  const fakeCommandServerApi = new FakeCommandServerApi();
  const neovimCommandServerApi = new NeovimCommandServerApi(client);
  // TODO: there are currently two ways to test if we are running tests, through neovimIDE.runMode and with isTesting()
  // We need to get rid of isTesting() entirely and use neovimIDE.runMode == "test" instead
  const commandServerApi =
    neovimIDE.runMode === "test"
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
  } = createCursorlessEngine(
    treeSitter,
    normalizedIde,
    hats,
    commandServerApi,
    fileSystem,
  );

  await registerCommands(client, neovimIDE, commandApi, commandServerApi);

  const cursorlessApi = {
    testHelpers:
      neovimIDE.runMode === "test"
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
  getNeovimRegistry().registerExtensionApi(EXTENSION_ID, cursorlessApi);

  console.log("activate(): Cursorless extension loaded");
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
  const cursorlessDir =
    neovimIDE.runMode === "test"
      ? path.join(os.tmpdir(), crypto.randomBytes(16).toString("hex"))
      : path.join(os.homedir(), ".cursorless");

  const fileSystem = new NeovimFileSystem(neovimIDE.runMode, cursorlessDir);
  await fileSystem.initialize();

  return { neovimIDE, hats, fileSystem };
}

// We don't need a parse tree for now, so just building a fake/empty one
function createTreeSitter(): TreeSitter {
  return {
    getNodeAtLocation(document: TextDocument, range: Range) {
      throw new UnsupportedLanguageError(document.languageId);
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

// https://github.com/cursorless-dev/vscode-parse-tree/blob/c0f1d024acca9ceace73bc0a0cd6106515303475/src/errors.ts#L1
export class UnsupportedLanguageError extends Error {
  constructor(language: string) {
    super(
      `Language '${language}' not supported by parse tree extension.  See https://github.com/pokey/vscode-parse-tree#adding-a-new-language`,
    );
    this.name = "UnsupportedLanguageError";
  }
}
