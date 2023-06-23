import { toCharacterRange, toLineRange } from "@cursorless/common";
import { Target } from "../typings/target.types";

export function getTargetRanges(target: Target) {
  return {
    contentRange: toCharacterRange(target.contentRange),
    removalRange: target.isLine
      ? toLineRange(target.getRemovalHighlightRange())
      : toCharacterRange(target.getRemovalHighlightRange()),
  };
}
