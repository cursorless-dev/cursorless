import { Target } from "../../typings/target.types";
import type { CursorMark } from "../../typings/targetDescriptor.types";
import {
  ProcessedTargetsContext,
  SelectionWithEditor,
} from "../../typings/Types";
import { isReversed } from "../../util/selectionUtils";
import { MarkStage } from "../PipelineStages.types";
import UntypedTarget from "../targets/UntypedTarget";

export default class CursorStage implements MarkStage {
  constructor(private modifier: CursorMark) {}

  run(context: ProcessedTargetsContext): Target[] {
    return cursorSelectionsToTarget(context.currentSelections);
  }
}

export function cursorSelectionsToTarget(selections: SelectionWithEditor[]) {
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
