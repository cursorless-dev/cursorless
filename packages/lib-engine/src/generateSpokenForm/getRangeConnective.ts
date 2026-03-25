import type { PartialRangeType } from "@cursorless/lib-common";
import { connectives } from "./defaultSpokenForms/connectives";
import { NoSpokenFormError } from "./NoSpokenFormError";

export function getRangeConnective(
  excludeAnchor: boolean,
  excludeActive: boolean,
  type?: PartialRangeType,
): string {
  const prefix = type === "vertical" ? `${connectives.verticalRange} ` : "";
  if (excludeAnchor && excludeActive) {
    return prefix + connectives.rangeExclusive;
  }
  if (excludeAnchor) {
    throw new NoSpokenFormError("Range exclude anchor");
  }
  if (excludeActive) {
    return prefix + connectives.rangeExcludingEnd;
  }
  if (type === "vertical") {
    // "slice", but could have been "slice past"
    return connectives.verticalRange;
  }
  return connectives.rangeInclusive;
}
