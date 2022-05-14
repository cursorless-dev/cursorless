import { ContainingScopeModifier } from "../../typings/target.types";
import { ProcessedTargetsContext, TypedSelection } from "../../typings/Types";
import { getDocumentRange } from "../../util/range";
import { ModifierStage } from "../PipelineStages.types";

export default class implements ModifierStage {
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
