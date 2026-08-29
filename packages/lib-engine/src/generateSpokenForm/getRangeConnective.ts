import type { PartialRangeType } from "@cursorless/lib-common";
import { connectiveDefaultSpokenForms } from "@cursorless/lib-common";
import { NoSpokenFormError } from "./NoSpokenFormError";

export function getRangeConnective(
  excludeAnchor: boolean,
  excludeActive: boolean,
  type?: PartialRangeType,
): string {
  const prefix =
    type === "vertical" ? `${connectiveDefaultSpokenForms.verticalRange} ` : "";
  if (excludeAnchor && excludeActive) {
    return prefix + connectiveDefaultSpokenForms.rangeExclusive;
  }
  if (excludeAnchor) {
    throw new NoSpokenFormError("Range exclude anchor");
  }
  if (excludeActive) {
    return prefix + connectiveDefaultSpokenForms.rangeExcludingEnd;
  }
  if (type === "vertical") {
    // "slice", but could have been "slice past"
    return connectiveDefaultSpokenForms.verticalRange;
  }
  return connectiveDefaultSpokenForms.rangeInclusive;
}
