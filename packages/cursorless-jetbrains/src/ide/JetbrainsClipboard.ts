import type { Clipboard } from "@cursorless/common";
import { JetbrainsClient } from "./JetbrainsClient"

export class JetbrainsClipboard implements Clipboard {
  constructor(private client: JetbrainsClient) {}

  async readText(): Promise<string> {
    return "";
  }

  async writeText(value: string): Promise<void> {
    return;
  }
}
