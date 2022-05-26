import { SourceMark, Target } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { isReversed } from "../../util/selectionUtils";
import { getTokenDelimiters } from "../modifiers/scopeTypeStages/TokenStage";
import { MarkStage } from "../PipelineStages.types";
import WeakTarget from "../targets/WeakTarget";

export default class implements MarkStage {
  constructor(private modifier: SourceMark) {}

  run(context: ProcessedTargetsContext): Target[] {
    if (context.sourceMark.length === 0) {
      throw Error("No available source marks");
    }
    return context.sourceMark.map((selection) => {
      return new WeakTarget({
        ...getTokenDelimiters(selection.editor, selection.selection),
        editor: selection.editor,
        isReversed: isReversed(selection.selection),
        contentRange: selection.selection,
      });
    });
  }
}
