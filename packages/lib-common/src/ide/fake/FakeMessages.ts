import type { MessageId, Messages, MessageType } from "../types/Messages";

export class FakeMessages implements Messages {
  showMessage(
    _type: MessageType,
    _id: MessageId,
    _message: string,
    ..._options: string[]
  ): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }
}
