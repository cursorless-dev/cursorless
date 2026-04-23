import type { MessageId, Messages, MessageType } from "@cursorless/lib-common";

export class NeovimMessages implements Messages {
  showMessage(
    _type: MessageType,
    _id: MessageId,
    _message: string,
    ..._options: string[]
  ): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }
}
