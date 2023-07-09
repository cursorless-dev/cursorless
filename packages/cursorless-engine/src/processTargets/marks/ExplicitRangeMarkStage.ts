import { ExplicitRangeMark, Range } from "@cursorless/common";
import { Target } from "../../typings/target.types";
import { MarkStage } from "../PipelineStages.types";
import { UntypedTarget } from "../targets";
import { ide } from "../../singletons/ide.singleton";

export default class implements MarkStage {
  constructor(private mark: ExplicitRangeMark) {}

  run(): Target[] {
    const editor = ide().visibleTextEditors.find(
      (e) => e.id === this.mark.editorId,
    );

    if (editor == null) {
      throw new Error(`Couldn't find editor '${this.mark.editorId}'`);
    }

    const contentRange = new Range(
      this.mark.range.start.line,
      this.mark.range.start.character,
      this.mark.range.end.line,
      this.mark.range.end.character,
    );

    return [
      new UntypedTarget({
        editor,
        contentRange,
        isReversed: false,
        hasExplicitRange: false,
      }),
    ];
  }
}
