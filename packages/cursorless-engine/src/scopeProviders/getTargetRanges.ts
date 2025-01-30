import type { TargetRanges } from "@cursorless/common";
import type { Target } from "../typings/target.types";

export function getTargetRanges(target: Target): TargetRanges {
  return {
    contentRange: target.contentRange,
    removalRange: target.getRemovalRange(),
    removalHighlightRange: target.getRemovalHighlightRange(),
    leadingDelimiter: getOptionalTarget(target.getLeadingDelimiterTarget()),
    trailingDelimiter: getOptionalTarget(target.getTrailingDelimiterTarget()),
    interior: target.getInterior()?.map(getTargetRanges),
    boundary: target.getBoundary()?.map(getTargetRanges),
    insertionDelimiter: target.insertionDelimiter,
  };
}

function getOptionalTarget(target: Target | undefined) {
  return target != null ? getTargetRanges(target) : undefined;
}
