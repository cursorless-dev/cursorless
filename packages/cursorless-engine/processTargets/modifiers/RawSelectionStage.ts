import type { Target } from "../../typings/target.types";
import type { RawSelectionModifier } from "@cursorless/common";
import type { ProcessedTargetsContext } from "../../typings/Types";
import type { ModifierStage } from "../PipelineStages.types";
import { RawSelectionTarget } from "../targets";

export default class RawSelectionStage implements ModifierStage {
  constructor(private modifier: RawSelectionModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    return [
      new RawSelectionTarget({
        editor: target.editor,
        contentRange: target.contentRange,
        isReversed: target.isReversed,
      }),
    ];
  }
}
