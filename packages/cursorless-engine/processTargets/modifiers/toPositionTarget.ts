import { Range } from "@cursorless/common";
import { Target } from "../../typings/target.types";
import { Position } from "../../../common/types/command/PartialTargetDescriptor.types";
import { PositionTarget } from "../targets";

export function toPositionTarget(target: Target, position: Position): Target {
  const { start, end } = target.contentRange;
  let contentRange: Range;
  let insertionDelimiter: string;

  switch (position) {
    case "before":
      contentRange = new Range(start, start);
      insertionDelimiter = target.insertionDelimiter;
      break;

    case "after":
      contentRange = new Range(end, end);
      insertionDelimiter = target.insertionDelimiter;
      break;

    case "start":
      contentRange = new Range(start, start);
      insertionDelimiter = "";
      break;

    case "end":
      contentRange = new Range(end, end);
      insertionDelimiter = "";
      break;
  }

  return new PositionTarget({
    editor: target.editor,
    isReversed: target.isReversed,
    contentRange,
    thatTarget: target,
    position,
    insertionDelimiter,
    isRaw: target.isRaw,
  });
}
