import { Messages } from "../../../../ide/ide.types";

export default class FakeMessages implements Messages {
  async showWarning(
    _message: string,
    ..._options: string[]
  ): Promise<string | undefined> {
    return undefined;
  }
}
