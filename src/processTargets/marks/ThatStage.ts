import { Target, ThatMark } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { isReversed } from "../../util/selectionUtils";
import { MarkStage } from "../PipelineStages.types";
import WeakTarget from "../targets/WeakTarget";

export default class implements MarkStage {
  constructor(private modifier: ThatMark) {}

  run(context: ProcessedTargetsContext): Target[] {
    if (context.thatMark.length === 0) {
      throw Error("No available that marks");
    }
    return context.thatMark.map((selection) => {
      return new WeakTarget({
        editor: selection.editor,
        isReversed: isReversed(selection.selection),
        contentRange: selection.selection,
      });
    });
  }
}
