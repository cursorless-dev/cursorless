import type { NeovimClient } from "neovim";
import type { Clipboard } from "@cursorless/lib-common";
import { getClipboard, setClipboard } from "../../neovimApi";

export class NeovimClipboard implements Clipboard {
  constructor(private client: NeovimClient) {}

  async readText(): Promise<string> {
    return await getClipboard(this.client);
  }

  async writeText(value: string): Promise<void> {
    return await setClipboard(value, this.client);
  }
}
