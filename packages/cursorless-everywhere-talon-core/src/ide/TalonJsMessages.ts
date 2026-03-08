import { MessageType, type Messages } from "@cursorless/common";
import type { Talon } from "../types/talon.types";

export class TalonJsMessages implements Messages {
  constructor(private talon: Talon) {}

  async showMessage(
    type: MessageType,
    _id: string,
    message: string,
    ...options: string[]
  ): Promise<string | undefined> {
    if (options.length > 0) {
      throw Error(`Message options are not supported in TalonJsMessages.`);
    }
    switch (type) {
      case MessageType.info:
        this.talon.actions.app.notify(message, "Cursorless");
        break;
      case MessageType.warning:
        this.talon.actions.app.notify(message, "[WARNING] Cursorless");
        break;
      case MessageType.error:
        this.talon.actions.app.notify(message, "[ERROR] Cursorless");
    }
    return undefined;
  }
}
