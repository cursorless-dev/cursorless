import { window } from "vscode";
import { MessageId, Messages } from "../ide.types";

export default class VscodeMessages implements Messages {
  async showWarning(
    _id: MessageId,
    message: string,
    ...options: string[]
  ): Promise<string | undefined> {
    return await window.showWarningMessage(message, ...options);
  }
}
