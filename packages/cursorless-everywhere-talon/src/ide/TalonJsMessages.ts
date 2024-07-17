import { actions } from "talon";
import { MessageType, type Messages } from "@cursorless/common";

export class TalonJsMessages implements Messages {
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
        actions.app.notify(message, "Cursorless");
        break;
      case MessageType.warning:
        actions.app.notify(message, "[WARNING] Cursorless");
        break;
      case MessageType.error:
        actions.app.notify(message, "[ERROR] Cursorless");
    }
    return undefined;
  }
}
