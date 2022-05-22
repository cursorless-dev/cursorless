import { DecoratedSymbolMark, Target } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { getTokenDelimiters } from "../modifiers/scopeTypeStages/TokenStage";
import { MarkStage } from "../PipelineStages.types";
import WeakTarget from "../targets/WeakTarget";

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
      new WeakTarget({
        ...getTokenDelimiters(token.editor, token.range),
        editor: token.editor,
        contentRange: token.range,
        isReversed: false,
      }),
    ];
  }
}
