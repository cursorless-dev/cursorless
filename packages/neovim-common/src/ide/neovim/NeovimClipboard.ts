import type { Clipboard } from "@cursorless/common";
import { getFromClipboard, putToClipboard } from "../../neovimApi";
import type { NeovimClient } from "neovim";

export default class NeovimClipboard implements Clipboard {
  constructor(private client: NeovimClient) {}

  async readText(): Promise<string> {
    return await getFromClipboard(this.client);
  }

  async writeText(value: string): Promise<void> {
    return await putToClipboard(value, this.client);
  }
}
