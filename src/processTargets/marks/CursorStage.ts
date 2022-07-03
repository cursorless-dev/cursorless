import { Target } from "../../typings/target.types";
import type { CursorMark } from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { isReversed } from "../../util/selectionUtils";
import { MarkStage } from "../PipelineStages.types";
import WeakTarget from "../targets/WeakTarget";

export default class CursorStage implements MarkStage {
  constructor(_modifier: CursorMark) {
    // takes mark for consistency and does nothing
  }

  run(context: ProcessedTargetsContext): Target[] {
    return context.currentSelections.map((selection) => {
      return new WeakTarget({
        editor: selection.editor,
        isReversed: isReversed(selection.selection),
        contentRange: selection.selection,
      });
    });
  }
}
