import type { NeovimClient } from "neovim/lib/api/client";
import type { NvimPlugin } from "neovim/lib/host/NvimPlugin";
import {
  FakeCommandServerApi,
  FakeIDE,
  NormalizedIDE,
} from "@cursorless/lib-common";
import { createCursorlessEngine } from "@cursorless/lib-engine";
import { EXTENSION_ID, NeovimIDE } from "@cursorless/lib-neovim-common";
import { getNeovimRegistry } from "@cursorless/lib-neovim-registry";
import { constructTestHelpers } from "./constructTestHelpers";
import { NeovimCommandServerApi } from "./NeovimCommandServerApi";
import { registerCommands } from "./registerCommands";

/**
 * This function is called from cursorless.nvim to initialize the Cursorless engine.
 * NOTE: this is not the cursorless-neovim extension entrypoint (which is called at Neovim startup)
 * We named it activate() in order to have the same structure as the extension entrypoint to match app-vscode
 */
export async function activate(plugin: NvimPlugin) {
  const client = plugin.nvim as NeovimClient;

  const neovimIDE = new NeovimIDE(client);
  await neovimIDE.init();

  const isTesting = neovimIDE.runMode === "test";

  const normalizedIde =
    neovimIDE.runMode === "production"
      ? neovimIDE
      : new NormalizedIDE(neovimIDE, new FakeIDE(), isTesting);

  const fakeCommandServerApi = new FakeCommandServerApi();
  const neovimCommandServerApi = new NeovimCommandServerApi(client);
  const commandServerApi = isTesting
    ? fakeCommandServerApi
    : neovimCommandServerApi;

  const { commandApi, storedTargets, hatTokenMap, scopeProvider, injectIde } =
    await createCursorlessEngine({ ide: normalizedIde, commandServerApi });

  await registerCommands(client, neovimIDE, commandApi, commandServerApi);

  const cursorlessApi = {
    testHelpers: isTesting
      ? constructTestHelpers(
          fakeCommandServerApi,
          storedTargets,
          hatTokenMap,
          neovimIDE,
          normalizedIde as NormalizedIDE,
          scopeProvider,
          injectIde,
        )
      : undefined,
  };
  getNeovimRegistry().registerExtensionApi(EXTENSION_ID, cursorlessApi);

  console.log("activate(): Cursorless extension loaded");
}
