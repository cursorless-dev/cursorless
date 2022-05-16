import { SourceMark, Target } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { isReversed } from "../../util/selectionUtils";
import { getTokenContext } from "../modifiers/scopeTypeStages/TokenStage";
import { MarkStage } from "../PipelineStages.types";

export default class implements MarkStage {
  constructor(private modifier: SourceMark) {}

  run(context: ProcessedTargetsContext): Target[] {
    return context.sourceMark.map((selection) => ({
      editor: selection.editor,
      isReversed: isReversed(selection.selection),
      contentRange: selection.selection,
      ...getTokenContext(selection.editor, selection.selection),
    }));
  }
}
