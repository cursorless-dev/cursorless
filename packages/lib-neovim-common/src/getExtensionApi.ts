import { getNeovimRegistry } from "@cursorless/lib-neovim-registry";
import type { NeovimTestHelpers } from "./TestHelpers";

export interface CursorlessApi {
  testHelpers: NeovimTestHelpers | undefined;
}

export async function getExtensionApi<T>(extensionId: string) {
  const api = getNeovimRegistry().getExtensionApi(extensionId);
  return api == null ? null : (api as T);
}

export async function getExtensionApiStrict<T>(extensionId: string) {
  const api = getNeovimRegistry().getExtensionApi(extensionId);

  if (api == null) {
    throw new Error(`Could not get ${extensionId} extension`);
  }

  return api as T;
}

export const EXTENSION_ID = "pokey.cursorless";
export const getCursorlessApi = () =>
  getExtensionApiStrict<CursorlessApi>(EXTENSION_ID);
