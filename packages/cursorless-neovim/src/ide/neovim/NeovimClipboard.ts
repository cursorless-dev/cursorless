import type { Clipboard } from "@cursorless/common";
import { neovimClient } from "../../singletons/client.singleton";
import { getFromClipboard, putToClipboard } from "../../neovimApi";

export default class NeovimClipboard implements Clipboard {
  async readText(): Promise<string> {
    const client = await neovimClient();
    return await getFromClipboard(client);
  }

  async writeText(value: string): Promise<void> {
    const client = await neovimClient();
    await putToClipboard(value, client);
  }
}
