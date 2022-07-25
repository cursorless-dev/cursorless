import { Target } from "../../typings/target.types";
import { SourceMark, ThatMark } from "../../typings/targetDescriptor.types";
import {
  ProcessedTargetsContext,
  SelectionWithEditor,
} from "../../typings/Types";
import { isReversed } from "../../util/selectionUtils";
import { MarkStage } from "../PipelineStages.types";
import { UntypedTarget } from "../targets";

export class ThatStage implements MarkStage {
  constructor(_modifier: ThatMark) {
    // Empty
  }

  run(context: ProcessedTargetsContext): Target[] {
    if (context.thatMark.length === 0) {
      throw Error("No available that marks");
    }

    return selectionsToTarget(context.thatMark);
  }
}

export class SourceStage implements MarkStage {
  constructor(_modifier: SourceMark) {
    // Empty
  }

  run(context: ProcessedTargetsContext): Target[] {
    if (context.sourceMark.length === 0) {
      throw Error("No available that marks");
    }

    return selectionsToTarget(context.sourceMark);
  }
}

function selectionsToTarget(selections: SelectionWithEditor[]) {
  return selections.map(
    (selection) =>
      new UntypedTarget({
        editor: selection.editor,
        isReversed: isReversed(selection.selection),
        contentRange: selection.selection,
        hasExplicitRange: !selection.selection.isEmpty,
      })
  );
}
