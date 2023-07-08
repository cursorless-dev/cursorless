import { InsertionMode, Range } from "@cursorless/common";
import { Target } from "../../typings/target.types";
import { PositionTarget } from "../targets";

export function toPositionTarget(
  target: Target,
  insertionMode: InsertionMode,
): Target {
  const contentRange = (() => {
    switch (insertionMode) {
      case "before":
        return new Range(target.contentRange.start, target.contentRange.start);
      case "after":
        return new Range(target.contentRange.end, target.contentRange.end);
      case "to":
        return target.contentRange;
    }
  })();

  return new PositionTarget({
    editor: target.editor,
    isReversed: target.isReversed,
    contentRange,
    thatTarget: target,
    insertionMode,
    insertionDelimiter: target.insertionDelimiter,
    isRaw: target.isRaw,
  });
}
