import type { MessageId, Messages, MessageType } from "../types/Messages";

export interface Message {
  type: MessageType;

  /**
   * Each place that we show a message, we should use a message class for
   * testability, so that our tests aren't tied to specific message wording.
   */
  id: MessageId;
}

export default class SpyMessages implements Messages {
  private shownMessages: Message[] = [];

  constructor(private original: Messages) {}

  showMessage(
    type: MessageType,
    id: MessageId,
    message: string,
    ...options: string[]
  ): Promise<string | undefined> {
    this.shownMessages.push({ type, id });

    return this.original.showMessage(type, id, message, ...options);
  }

  getSpyValues() {
    return this.shownMessages.length > 0 ? this.shownMessages : undefined;
  }
}
