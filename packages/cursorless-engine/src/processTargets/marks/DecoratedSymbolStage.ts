import { DecoratedSymbolMark, ReadOnlyHatMap } from "@cursorless/common";
import { Target } from "../../typings/target.types";
import { MarkStage } from "../PipelineStages.types";
import { UntypedTarget } from "../targets";

export default class implements MarkStage {
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
