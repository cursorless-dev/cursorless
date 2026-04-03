import type { Clipboard } from "@cursorless/lib-common";
import type { Talon } from "../types/talon";

export class TalonJsClipboard implements Clipboard {
  constructor(private talon: Talon) {}

  readText(): Promise<string> {
    return Promise.resolve(this.talon.actions.clip.text());
  }

  writeText(value: string): Promise<void> {
    this.talon.actions.clip.set_text(value);
    return Promise.resolve();
  }
}
