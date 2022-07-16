import { Target } from "../../typings/target.types";
import type { CursorMark } from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { isReversed } from "../../util/selectionUtils";
import { MarkStage } from "../PipelineStages.types";
import WeakTarget from "../targets/WeakTarget";
import TokenTarget from "../targets/TokenTarget";

export default class CursorStage implements MarkStage {
  constructor(_modifier: CursorMark) {
    // takes mark for consistency and does nothing
  }

  run(context: ProcessedTargetsContext): Target[] {
    return context.currentSelections.map((selection) => {
      const parameters = {
        editor: selection.editor,
        isReversed: isReversed(selection.selection),
        contentRange: selection.selection,
      };
      return selection.selection.isEmpty
        ? new WeakTarget(parameters)
        : new TokenTarget(parameters);
    });
  }
}
