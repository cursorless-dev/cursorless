import type { Target } from "../../typings/target.types";
import type { RawSelectionModifier } from "@cursorless/common";
import type { ModifierStage } from "../PipelineStages.types";
import { RawSelectionTarget } from "../targets";

export class RawSelectionStage implements ModifierStage {
  constructor(private modifier: RawSelectionModifier) {}

  async run(target: Target): Promise<Target[]> {
    return [
      new RawSelectionTarget({
        editor: target.editor,
        contentRange: target.contentRange,
        isReversed: target.isReversed,
      }),
    ];
  }
}
