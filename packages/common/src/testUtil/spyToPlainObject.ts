import type { Message, SpyIDERecordedValues } from "..";
import type {
  PlainFlashDescriptor,
  PlainHighlight} from "../util/toPlainObject";
import {
  generalizedRangeToPlainObject,
} from "../util/toPlainObject";

export interface PlainSpyIDERecordedValues {
  messages: Message[] | undefined;
  flashes: PlainFlashDescriptor[] | undefined;
  highlights: PlainHighlight[] | undefined;
}

export function spyIDERecordedValuesToPlainObject(
  input: SpyIDERecordedValues,
): PlainSpyIDERecordedValues {
  return {
    messages: input.messages,
    flashes: input.flashes?.map((descriptor) => ({
      style: descriptor.style,
      range: generalizedRangeToPlainObject(descriptor.range),
    })),
    highlights: input.highlights?.map((highlight) => ({
      highlightId: highlight.highlightId,
      ranges: highlight.ranges.map((range) =>
        generalizedRangeToPlainObject(range),
      ),
    })),
  };
}
