import type { FlashDescriptor } from "@cursorless/common";
import type { Talon } from "../types/talon.types";
import type { FlashDescriptorOffsets } from "../types/types";
import { toGeneralizedRangeOffsets } from "./toGeneralizedRangeOffsets";

export function flashRanges(
  talon: Talon,
  flashDescriptors: FlashDescriptor[],
): Promise<void> {
  const offsetDescriptors = flashDescriptors.map(
    (descriptor): FlashDescriptorOffsets => {
      return {
        style: descriptor.style,
        range: toGeneralizedRangeOffsets(descriptor.editor, descriptor.range),
      };
    },
  );

  talon.actions.user.cursorless_everywhere_flash_ranges(offsetDescriptors);

  return Promise.resolve();
}
