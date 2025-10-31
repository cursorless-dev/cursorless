import type { ExpandToFullLineModifier } from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import { expandToFullLine } from "../../util/rangeUtils";
import type { ModifierStage } from "../PipelineStages.types";
import { LineTarget, RawSelectionTarget } from "../targets";

export class ExpandToFullLineStage implements ModifierStage {
  constructor(private modifier: ExpandToFullLineModifier) {}

  run(target: Target): Target[] {
    const contentRange = expandToFullLine(target.editor, target.contentRange);
    return [
      new LineTarget({
        editor: target.editor,
        contentRange,
        isReversed: target.isReversed,
      }),
    ];
  }
}
