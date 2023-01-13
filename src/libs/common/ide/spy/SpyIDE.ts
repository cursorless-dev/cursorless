import { pickBy, values } from "lodash";
import { EditorGeneralizedRange } from "../../types/GeneralizedRange";
import PassthroughIDEBase from "../PassthroughIDEBase";
import { FlashDescriptor } from "../types/FlashDescriptor";
import type { HighlightId, IDE } from "../types/ide.types";
import SpyMessages, { Message } from "./SpyMessages";

interface Highlight {
  highlightId: HighlightId;
  ranges: EditorGeneralizedRange[];
}

export interface SpyIDERecordedValues {
  messages?: Message[];
  flashedRanges?: FlashDescriptor[];
  highlights?: Highlight[];
}

export default class SpyIDE extends PassthroughIDEBase {
  messages: SpyMessages;
  private flashedRanges: FlashDescriptor[] = [];
  private highlights: Highlight[] = [];

  constructor(original: IDE) {
    super(original);
    this.messages = new SpyMessages(original.messages);
  }

  getSpyValues(isFlashTest: boolean): SpyIDERecordedValues | undefined {
    const ret: SpyIDERecordedValues = {
      messages: this.messages.getSpyValues(),
      flashedRanges: isFlashTest ? this.flashedRanges : undefined,
      highlights: this.highlights.length === 0 ? undefined : this.highlights,
    };

    return values(ret).every((value) => value == null)
      ? undefined
      : pickBy(ret, (value) => value != null);
  }

  flashRanges(flashDescriptors: FlashDescriptor[]): Promise<void> {
    this.flashedRanges.push(...flashDescriptors);
    return super.flashRanges(flashDescriptors);
  }

  setHighlightRanges(
    highlightId: string,
    ranges: EditorGeneralizedRange[],
  ): Promise<void> {
    this.highlights.push({
      highlightId,
      ranges,
    });
    return super.setHighlightRanges(highlightId, ranges);
  }
}
