import type { Clipboard } from "@cursorless/common";

export class TalonJsClipboard implements Clipboard {
  readText(): Promise<string> {
    throw new Error("readText not implemented.");
  }

  writeText(value: string): Promise<void> {
    throw new Error("writeText not implemented.");
  }
}
