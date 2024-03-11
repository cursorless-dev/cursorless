import { VisibleModifier } from "@cursorless/common";
import { Target } from "../../typings/target.types";
import { ModifierStage } from "../PipelineStages.types";
import { PlainTarget } from "../targets";

export class VisibleStage implements ModifierStage {
  constructor(private modifier: VisibleModifier) {}

  async run(target: Target): Promise<Target[]> {
    return target.editor.visibleRanges.map(
      (range) =>
        new PlainTarget({
          editor: target.editor,
          isReversed: target.isReversed,
          contentRange: range,
        }),
    );
  }
}
