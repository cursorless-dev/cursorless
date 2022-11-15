import type { Messages } from "../types/Messages";

export default class FakeMessages implements Messages {
  async showWarning(
    _message: string,
    ..._options: string[]
  ): Promise<string | undefined> {
    return undefined;
  }
}
