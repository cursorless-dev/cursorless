import { Target } from "../../typings/target.types";
import { DecoratedSymbolMark } from "@cursorless/common";
import { ProcessedTargetsContext } from "../../typings/Types";
import { MarkStage } from "../PipelineStages.types";
import { UntypedTarget } from "../targets";

export default class implements MarkStage {
  constructor(private mark: DecoratedSymbolMark) {}

  run(context: ProcessedTargetsContext): Target[] {
    const token = context.hatTokenMap.getToken(
      this.mark.symbolColor,
      this.mark.character,
    );

    if (token == null) {
      throw new Error(
        `Couldn't find mark ${this.mark.symbolColor} '${this.mark.character}'`,
      );
    }

    return [
      new UntypedTarget({
        editor: token.editor,
        contentRange: token.range,
        isReversed: false,
        hasExplicitRange: false,
      }),
    ];
  }
}
