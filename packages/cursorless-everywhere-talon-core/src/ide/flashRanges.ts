import type { FlashDescriptor } from "@cursorless/common";
import type { Talon } from "../types/talon.types";
import type { RangeOffsets } from "../types/types";
import { toCharacterRangeOffsets } from "./toCharacterRangeOffsets";

export function flashRanges(
  talon: Talon,
  flashDescriptors: FlashDescriptor[],
): Promise<void> {
  const ranges = flashDescriptors.map(
    (descriptor): RangeOffsets =>
      toCharacterRangeOffsets(descriptor.editor, descriptor.range),
  );

  talon.actions.user.cursorless_everywhere_flash_ranges(ranges);

  return Promise.resolve();
}
