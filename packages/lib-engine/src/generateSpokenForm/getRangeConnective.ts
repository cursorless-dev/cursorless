import type { PartialRangeType } from "@cursorless/lib-common";
import { connectiveSpokenForms } from "@cursorless/lib-common";
import { NoSpokenFormError } from "./NoSpokenFormError";

export function getRangeConnective(
  excludeAnchor: boolean,
  excludeActive: boolean,
  type?: PartialRangeType,
): string {
  const prefix =
    type === "vertical" ? `${connectiveSpokenForms.verticalRange} ` : "";
  if (excludeAnchor && excludeActive) {
    return prefix + connectiveSpokenForms.rangeExclusive;
  }
  if (excludeAnchor) {
    throw new NoSpokenFormError("Range exclude anchor");
  }
  if (excludeActive) {
    return prefix + connectiveSpokenForms.rangeExcludingEnd;
  }
  if (type === "vertical") {
    // "slice", but could have been "slice past"
    return connectiveSpokenForms.verticalRange;
  }
  return connectiveSpokenForms.rangeInclusive;
}
