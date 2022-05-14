import { ProcessedTargetsContext, TypedSelection } from "../../typings/Types";
import { isReversed } from "../../util/selectionUtils";
import PipelineStage from "./PipelineStage";

export default class implements PipelineStage {
  run(context: ProcessedTargetsContext): TypedSelection[] {
    return context.sourceMark.map((selection) => ({
      editor: selection.editor,
      isReversed: isReversed(selection.selection),
      contentRange: selection.selection,
    }));
  }
}
