import type { Clipboard } from "@cursorless/common";

export default class NeovimClipboard implements Clipboard {
  private clipboardContents: string = "";

  async readText(): Promise<string> {
    return this.clipboardContents;
  }

  async writeText(value: string): Promise<void> {
    this.clipboardContents = value;
  }
}
