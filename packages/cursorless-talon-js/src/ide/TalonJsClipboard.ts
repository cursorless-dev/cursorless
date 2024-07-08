import { actions } from "talon";
import type { Clipboard } from "@cursorless/common";

export class TalonJsClipboard implements Clipboard {
  async readText(): Promise<string> {
    return actions.clip.text();
  }

  async writeText(value: string): Promise<void> {
    actions.clip.set_text(value);
  }
}
