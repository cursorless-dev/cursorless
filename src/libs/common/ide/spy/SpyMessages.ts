import type { MessageId, Messages } from "../types/Messages";

type MessageType = "info" | "warning" | "error";

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

  showWarning(
    id: MessageId,
    message: string,
    ...options: string[]
  ): Promise<string | undefined> {
    this.shownMessages.push({ type: "warning", id });

    return this.original.showWarning(id, message, ...options);
  }

  getSpyValues() {
    return this.shownMessages.length > 0 ? this.shownMessages : undefined;
  }
}
