import { window } from "vscode";
import { MessageId, Messages } from "../../libs/common/ide/types/Messages";

export default class VscodeMessages implements Messages {
  async showWarning(
    _id: MessageId,
    message: string,
    ...options: string[]
  ): Promise<string | undefined> {
    return await window.showWarningMessage(message, ...options);
  }
}
