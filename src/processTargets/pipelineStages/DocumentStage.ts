import { ContainingScopeModifier } from "../../typings/target.types";
import { ProcessedTargetsContext, TypedSelection } from "../../typings/Types";
import { getDocumentRange } from "../../util/range";
import PipelineStage from "./PipelineStage";

export default class implements PipelineStage {
  run(
    context: ProcessedTargetsContext,
    stage: ContainingScopeModifier,
    selection: TypedSelection
  ): TypedSelection {
    return {
      editor: selection.editor,
      isReversed: selection.isReversed,
      delimiter: "\n",
      contentRange: getDocumentRange(selection.editor.document),
    };
  }
}
