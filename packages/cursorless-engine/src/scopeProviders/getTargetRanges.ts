import {
  TargetRanges,
  toCharacterRange,
  toLineRange,
} from "@cursorless/common";
import { Target } from "../typings/target.types";

export function getTargetRanges(target: Target): TargetRanges {
  return {
    contentRange: target.contentRange,
    removalHighlightRange: target.isLine
      ? toLineRange(target.getRemovalHighlightRange())
      : toCharacterRange(target.getRemovalHighlightRange()),
  };
}
