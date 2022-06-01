import { Range } from "vscode";
import { Position, PositionModifier, Target } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";
import PositionTarget from "../targets/PositionTarget";

export default class PositionStage implements ModifierStage {
  constructor(private modifier: PositionModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    return [toPositionTarget(target, this.modifier.position)];
  }
}

export function toPositionTarget(target: Target, position: Position): Target {
  const { start, end } = target.contentRange;
  let contentRange: Range;
  let insertionDelimiter: string;

  /**
   * We give "after" and "before" targets a removal range for backwards
   * compatibility. This allows user to continue saying "chuck before" and
   * "chuck after" to remove leading or trailing delimiter. We prefer that users
   * use leading and trailing instead, but "before" and "after" are sometimes
   * easier to think of, so we're keeping them for now
   */
  let removalTarget: Target | undefined = undefined;

  switch (position) {
    case "before":
      contentRange = new Range(start, start);
      insertionDelimiter = target.insertionDelimiter;
      removalTarget = target.getLeadingDelimiterTarget();
      break;

    case "after":
      contentRange = new Range(end, end);
      insertionDelimiter = target.insertionDelimiter;
      removalTarget = target.getTrailingDelimiterTarget();
      break;

    case "start":
      contentRange = new Range(start, start);
      // This it NOT a raw target. Joining with this should be done on empty delimiter.
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
    position,
    insertionDelimiter,
    isRaw: target.isRaw,
    removalTarget,
  });
}
