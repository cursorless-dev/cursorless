import type { VisibleModifier } from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import type { ModifierStage } from "../PipelineStages.types";
import { PlainTarget } from "../targets";

export class VisibleStage implements ModifierStage {
  constructor(private modifier: VisibleModifier) {}

  run(target: Target): Target[] {
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
