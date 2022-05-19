import { DecoratedSymbolMark, Target } from "../../typings/target.types";
import BaseTarget from "../targets/BaseTarget";
import { ProcessedTargetsContext } from "../../typings/Types";
import { getTokenContext } from "../modifiers/scopeTypeStages/TokenStage";
import { MarkStage } from "../PipelineStages.types";

export default class implements MarkStage {
  constructor(private modifier: DecoratedSymbolMark) {}

  run(context: ProcessedTargetsContext): Target[] {
    const token = context.hatTokenMap.getToken(
      this.modifier.symbolColor,
      this.modifier.character
    );
    if (token == null) {
      throw new Error(
        `Couldn't find mark ${this.modifier.symbolColor} '${this.modifier.character}'`
      );
    }
    return [
      new BaseTarget({
        ...getTokenContext(token.editor, token.range),
        scopeType: "token",
        editor: token.editor,
        contentRange: token.range,
        isReversed: false,
      }),
    ];
  }
}
