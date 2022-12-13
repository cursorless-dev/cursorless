import { pickBy, values } from "lodash";
import PassthroughIDEBase from "../PassthroughIDEBase";
import type { IDE } from "../types/ide.types";
import SpyMessages, { Message } from "./SpyMessages";

export interface SpyIDERecordedValues {
  messages?: Message[];
}

export default class SpyIDE extends PassthroughIDEBase {
  messages: SpyMessages;

  constructor(original: IDE) {
    super(original);
    this.messages = new SpyMessages(original.messages);
  }

  getSpyValues(): SpyIDERecordedValues | undefined {
    const ret = {
      messages: this.messages.getSpyValues(),
    };

    return values(ret).every((value) => value == null)
      ? undefined
      : pickBy(ret, (value) => value != null);
  }
}
