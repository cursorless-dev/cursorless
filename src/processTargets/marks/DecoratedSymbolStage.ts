import type { Target } from "../../typings/target.types";
import type { DecoratedSymbolMark } from "../../typings/targetDescriptor.types";
import type { ProcessedTargetsContext } from "../../typings/Types";
import type { MarkStage } from "../PipelineStages.types";
import { WeakTarget } from "../targets";

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
        editor: token.editor,
        contentRange: token.range,
        isReversed: false,
      }),
    ];
  }
}
