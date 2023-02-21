import { window } from "vscode";
import { MessageId, Messages, MessageType } from "@cursorless/common";

export default class VscodeMessages implements Messages {
  async showMessage(
    type: MessageType,
    _id: MessageId,
    message: string,
    ...options: string[]
  ): Promise<string | undefined> {
    switch (type) {
      case MessageType.info:
        return await window.showInformationMessage(message, ...options);
      case MessageType.warning:
        return await window.showWarningMessage(message, ...options);
      case MessageType.error:
        return await window.showErrorMessage(message, ...options);
    }
  }
}
