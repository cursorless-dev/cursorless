import { Range } from "vscode";
import { DecoratedSymbol } from "../../typings/target.types";
import { ProcessedTargetsContext, TypedSelection } from "../../typings/Types";
import PipelineStage from "./PipelineStage";

export default class implements PipelineStage {
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
        contentRange: new Range(token.range.start, token.range.end),
      },
    ];
  }
}
