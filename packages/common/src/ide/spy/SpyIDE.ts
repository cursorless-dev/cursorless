import { pickBy, values } from "lodash";
import type { GeneralizedRange } from "../../types/GeneralizedRange";
import type { TextEditor } from "../../types/TextEditor";
import PassthroughIDEBase from "../PassthroughIDEBase";
import type { FlashDescriptor } from "../types/FlashDescriptor";
import type { HighlightId, IDE } from "../types/ide.types";
import type { Message } from "./SpyMessages";
import SpyMessages from "./SpyMessages";

interface Highlight {
  highlightId: HighlightId | undefined;
  ranges: GeneralizedRange[];
}

export interface SpyIDERecordedValues {
  messages?: Message[];
  flashes?: FlashDescriptor[];
  highlights?: Highlight[];
}

export default class SpyIDE extends PassthroughIDEBase {
  messages: SpyMessages;
  private flashes: FlashDescriptor[] = [];
  private highlights: Highlight[] = [];

  constructor(original: IDE) {
    super(original);
    this.messages = new SpyMessages(original.messages);
  }

  getSpyValues(isFlashTest: boolean): SpyIDERecordedValues | undefined {
    const ret: SpyIDERecordedValues = {
      messages: this.messages.getSpyValues(),
      flashes: isFlashTest ? this.flashes : undefined,
      highlights: this.highlights.length === 0 ? undefined : this.highlights,
    };

    return values(ret).every((value) => value == null)
      ? undefined
      : pickBy(ret, (value) => value != null);
  }

  flashRanges(flashDescriptors: FlashDescriptor[]): Promise<void> {
    this.flashes.push(...flashDescriptors);
    return super.flashRanges(flashDescriptors);
  }

  setHighlightRanges(
    highlightId: string | undefined,
    editor: TextEditor,
    ranges: GeneralizedRange[],
  ): Promise<void> {
    this.highlights.push({
      highlightId,
      ranges,
    });
    return super.setHighlightRanges(highlightId, editor, ranges);
  }
}
