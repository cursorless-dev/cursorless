import type { DecoratedSymbolMark, ReadOnlyHatMap } from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import type { MarkStage } from "../PipelineStages.types";
import { UntypedTarget } from "../targets";

export class DecoratedSymbolStage implements MarkStage {
  constructor(
    private readableHatMap: ReadOnlyHatMap,
    private mark: DecoratedSymbolMark,
  ) {}

  run(): Target[] {
    const token = this.readableHatMap.getToken(
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
