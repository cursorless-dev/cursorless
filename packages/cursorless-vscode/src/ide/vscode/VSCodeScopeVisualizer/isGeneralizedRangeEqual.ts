import { GeneralizedRange } from "@cursorless/common";

export function isGeneralizedRangeEqual(
  a: GeneralizedRange,
  b: GeneralizedRange): boolean {
  if (a.type === "character" && b.type === "character") {
    return a.start.isEqual(b.start) && a.end.isEqual(b.end);
  }

  if (a.type === "line" && b.type === "line") {
    return a.start === b.start && a.end === b.end;
  }

  return false;
}
