import {
  FakeCommandServerApi,
  FakeIDE,
  NormalizedIDE,
} from "@cursorless/common";
import { createCursorlessEngine } from "@cursorless/cursorless-engine";
import { EXTENSION_ID, NeovimIDE } from "@cursorless/neovim-common";
import { getNeovimRegistry } from "@cursorless/neovim-registry";
import type { NeovimClient } from "neovim/lib/api/client";
import type { NvimPlugin } from "neovim/lib/host/NvimPlugin";
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

  const neovimIDE = new NeovimIDE(client);
  await neovimIDE.init();

  const normalizedIde =
    neovimIDE.runMode === "production"
      ? neovimIDE
      : new NormalizedIDE(
          neovimIDE,
          new FakeIDE(),
          neovimIDE.runMode === "test",
          undefined,
        );

  const fakeCommandServerApi = new FakeCommandServerApi();
  const neovimCommandServerApi = new NeovimCommandServerApi(client);
  const commandServerApi =
    neovimIDE.runMode === "test"
      ? fakeCommandServerApi
      : neovimCommandServerApi;

  const {
    commandApi,
    storedTargets,
    hatTokenMap,
    scopeProvider,
    injectIde,
    runIntegrationTests,
  } = await createCursorlessEngine({ ide: normalizedIde, commandServerApi });

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
            scopeProvider,
            injectIde,
            runIntegrationTests,
          )
        : undefined,
  };
  getNeovimRegistry().registerExtensionApi(EXTENSION_ID, cursorlessApi);

  console.log("activate(): Cursorless extension loaded");
}
