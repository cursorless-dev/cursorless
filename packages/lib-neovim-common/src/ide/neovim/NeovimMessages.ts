import type { MessageId, Messages, MessageType } from "@cursorless/common";

export default class NeovimMessages implements Messages {
  async showMessage(
    _type: MessageType,
    _id: MessageId,
    _message: string,
    ..._options: string[]
  ): Promise<string | undefined> {
    return undefined;
  }
}
