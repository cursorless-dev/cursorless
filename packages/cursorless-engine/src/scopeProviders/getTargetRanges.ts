import {
  TargetRanges,
  toCharacterRange,
  toLineRange,
} from "@cursorless/common";
import { Target } from "../typings/target.types";

export function getTargetRanges(target: Target): TargetRanges {
  const interior = (() => {
    try {
      target.getInteriorStrict().map(getTargetRanges);
    } catch (error) {
      return undefined;
    }
  })();

  const boundary = (() => {
    try {
      target.getBoundaryStrict().map(getTargetRanges);
    } catch (error) {
      return undefined;
    }
  })();

  return {
    contentRange: target.contentRange,
    removalRange: target.getRemovalRange(),
    removalHighlightRange: target.isLine
      ? toLineRange(target.getRemovalHighlightRange())
      : toCharacterRange(target.getRemovalHighlightRange()),
    leadingDelimiter: getOptionalTarget(target.getLeadingDelimiterTarget()),
    trailingDelimiter: getOptionalTarget(target.getTrailingDelimiterTarget()),
    interior,
    boundary,
    insertionDelimiter: target.insertionDelimiter,
  };
}

function getOptionalTarget(target: Target | undefined) {
  return target != null ? getTargetRanges(target) : undefined;
}
