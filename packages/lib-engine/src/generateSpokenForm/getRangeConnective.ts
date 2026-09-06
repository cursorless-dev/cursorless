import type { PartialRangeType } from "@cursorless/lib-common";
import type { SpokenFormComponentMap } from "./getSpokenFormComponentMap";
import type { SpokenFormComponent } from "./SpokenFormComponent";

export function getRangeConnective(
  spokenFormMap: SpokenFormComponentMap,
  excludeAnchor: boolean,
  excludeActive: boolean,
  type?: PartialRangeType,
): SpokenFormComponent {
  const prefix =
    type === "vertical" ? spokenFormMap.connective.verticalRange : undefined;
  if (excludeAnchor && excludeActive) {
    return prefix != null
      ? [prefix, spokenFormMap.connective.rangeExclusive]
      : spokenFormMap.connective.rangeExclusive;
  }
  if (excludeAnchor) {
    return prefix != null
      ? [prefix, spokenFormMap.connective.rangeExcludingStart]
      : spokenFormMap.connective.rangeExcludingStart;
  }
  if (excludeActive) {
    return prefix != null
      ? [prefix, spokenFormMap.connective.rangeExcludingEnd]
      : spokenFormMap.connective.rangeExcludingEnd;
  }
  if (type === "vertical") {
    // "slice", but could have been "slice past"
    return spokenFormMap.connective.verticalRange;
  }
  return spokenFormMap.connective.rangeInclusive;
}
