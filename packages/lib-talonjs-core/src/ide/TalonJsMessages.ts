import type { Messages } from "@cursorless/lib-common";
import { MessageType } from "@cursorless/lib-common";
import type { Talon } from "../types/talon";

export class TalonJsMessages implements Messages {
  constructor(private talon: Talon) {}

  showMessage(
    type: MessageType,
    _id: string,
    message: string,
    ...options: string[]
  ): Promise<string | undefined> {
    if (options.length > 0) {
      throw new Error(`Message options are not supported in TalonJsMessages.`);
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
        break;
      default: {
        const _exhaustiveCheck: never = type;
      }
    }
    return Promise.resolve(undefined);
  }
}
