import type { MessageType, Messages } from "@cursorless/common";

export class TalonJsMessages implements Messages {
  showMessage(
    type: MessageType,
    id: string,
    message: string,
    ...options: string[]
  ): Promise<string | undefined> {
    throw new Error("showMessage not implemented.");
  }
}
