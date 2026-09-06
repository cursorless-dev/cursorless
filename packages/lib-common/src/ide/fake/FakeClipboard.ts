import type { Clipboard } from "../types/Clipboard";

export class FakeClipboard implements Clipboard {
  private clipboardContents: string = "";

  readText(): Promise<string> {
    return Promise.resolve(this.clipboardContents);
  }

  writeText(value: string): Promise<void> {
    this.clipboardContents = value;
    return Promise.resolve();
  }
}
