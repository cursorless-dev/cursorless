import { CursorMark, Target } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { isReversed } from "../../util/selectionUtils";
import { getTokenDelimiters } from "../modifiers/scopeTypeStages/TokenStage";
import { MarkStage } from "../PipelineStages.types";
import BaseTarget from "../targets/BaseTarget";

export default class implements MarkStage {
  constructor(private modifier: CursorMark) {}

  run(context: ProcessedTargetsContext): Target[] {
    return context.currentSelections.map((selection) => {
      return new BaseTarget({
        ...getTokenDelimiters(selection.editor, selection.selection),
        editor: selection.editor,
        isReversed: isReversed(selection.selection),
        contentRange: selection.selection,
      });
    });
  }
}
