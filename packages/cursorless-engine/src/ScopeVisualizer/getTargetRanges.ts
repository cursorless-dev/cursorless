import { toCharacterRange, toLineRange } from "@cursorless/common";
import type { Target } from "../typings/target.types";
import type { TargetRanges } from "../api/ScopeProvider";

export function getTargetRanges(target: Target): TargetRanges {
  return {
    contentRange: target.contentRange,
    removalHighlightRange: target.isLine
      ? toLineRange(target.getRemovalHighlightRange())
      : toCharacterRange(target.getRemovalHighlightRange()),
  };
}
