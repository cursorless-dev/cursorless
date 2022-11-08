import type { Clipboard } from "../types/Clipboard";

export default class FakeClipboard implements Clipboard {
  private clipboardContents: string = "";

  async readText(): Promise<string> {
    return this.clipboardContents;
  }

  async writeText(value: string): Promise<void> {
    this.clipboardContents = value;
  }
}
