import { Target } from "../../typings/target.types";
import type { CursorMark } from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { isReversed } from "../../util/selectionUtils";
import { MarkStage } from "../PipelineStages.types";
import UntypedRangeTarget from "../targets/UntypedRangeTarget";

export default class CursorStage implements MarkStage {
  constructor(private modifier: CursorMark) {}

  run(context: ProcessedTargetsContext): Target[] {
    return context.currentSelections.map(
      (selection) =>
        new UntypedRangeTarget({
          editor: selection.editor,
          isReversed: isReversed(selection.selection),
          contentRange: selection.selection,
          hasExplicitRange: !selection.selection.isEmpty,
        })
    );
  }
}
