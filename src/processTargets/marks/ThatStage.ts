import { Target } from "../../typings/target.types";
import { ThatMark } from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { isReversed } from "../../util/selectionUtils";
import { MarkStage } from "../PipelineStages.types";
import UntypedRangeTarget from "../targets/UntypedRangeTarget";

export default class implements MarkStage {
  constructor(private modifier: ThatMark) {}

  run(context: ProcessedTargetsContext): Target[] {
    if (context.thatMark.length === 0) {
      throw Error("No available that marks");
    }
    return context.thatMark.map((selection) => {
      return new UntypedRangeTarget({
        editor: selection.editor,
        isReversed: isReversed(selection.selection),
        contentRange: selection.selection,
        hasExplicitRange: !selection.selection.isEmpty,
      });
    });
  }
}
