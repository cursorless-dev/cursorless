import type { TargetRanges } from "@cursorless/common";
import { toCharacterRange, toLineRange } from "@cursorless/common";
import type { Target } from "../typings/target.types";

export function getTargetRanges(target: Target): TargetRanges {
  return {
    contentRange: target.contentRange,
    removalRange: target.getRemovalRange(),
    removalHighlightRange: isLine(target)
      ? toLineRange(target.getRemovalHighlightRange())
      : toCharacterRange(target.getRemovalHighlightRange()),
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

function isLine(target: Target): boolean {
  const { type } = target;
  return type === "line" || type === "paragraph" || type === "document";
}
