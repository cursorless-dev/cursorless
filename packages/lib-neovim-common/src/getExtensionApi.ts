import { getNeovimRegistry } from "@cursorless/lib-neovim-registry";
import type { NeovimTestHelpers } from "./TestHelpers";

export interface CursorlessApi {
  testHelpers: NeovimTestHelpers | undefined;
}

function getExtensionApiStrict<T>(extensionId: string) {
  const api = getNeovimRegistry().getExtensionApi(extensionId);

  if (api == null) {
    throw new Error(`Could not get ${extensionId} extension`);
  }

  return api as T;
}

export const EXTENSION_ID = "pokey.cursorless";
export const getCursorlessApi = () =>
  getExtensionApiStrict<CursorlessApi>(EXTENSION_ID);
