import type { MessageId, Messages, MessageType } from "../types/Messages";

export default class FakeMessages implements Messages {
  async showMessage(
    _type: MessageType,
    _id: MessageId,
    _message: string,
    ..._options: string[]
  ): Promise<string | undefined> {
    return undefined;
  }
}
