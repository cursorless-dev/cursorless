import { DecoratedSymbol } from "../../typings/target.types";
import { ProcessedTargetsContext, TypedSelection } from "../../typings/Types";
import { getTokenContext } from "../modifiers/TokenStage";
import { MarkStage } from "../PipelineStages.types";

export default class implements MarkStage {
  run(
    context: ProcessedTargetsContext,
    stage: DecoratedSymbol
  ): TypedSelection[] {
    const token = context.hatTokenMap.getToken(
      stage.symbolColor,
      stage.character
    );
    if (token == null) {
      throw new Error(
        `Couldn't find mark ${stage.symbolColor} '${stage.character}'`
      );
    }
    return [
      {
        editor: token.editor,
        contentRange: token.range,
        ...getTokenContext(token.editor, token.range),
      },
    ];
  }
}
