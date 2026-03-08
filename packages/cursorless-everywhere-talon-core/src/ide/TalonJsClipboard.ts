import type { Clipboard } from "@cursorless/common";
import type { Talon } from "../types/talon.types";

export class TalonJsClipboard implements Clipboard {
  constructor(private talon: Talon) {}

  async readText(): Promise<string> {
    return this.talon.actions.clip.text();
  }

  async writeText(value: string): Promise<void> {
    this.talon.actions.clip.set_text(value);
  }
}
