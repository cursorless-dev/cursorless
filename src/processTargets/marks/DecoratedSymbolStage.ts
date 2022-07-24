import { Target } from "../../typings/target.types";
import { DecoratedSymbolMark } from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { MarkStage } from "../PipelineStages.types";
import { UntypedRangeTarget } from "../targets";

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
      new UntypedRangeTarget({
        editor: token.editor,
        contentRange: token.range,
        isReversed: false,
        hasExplicitRange: false,
      }),
    ];
  }
}
