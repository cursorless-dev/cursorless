import {
  ExcludeInteriorModifier,
  InteriorOnlyModifier,
  Target,
} from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";
import WeakTarget from "../targets/WeakTarget";
import { processedSurroundingPairTarget } from "./SurroundingPairStage";

abstract class InteriorStage implements ModifierStage {
  abstract getTargets(target: Target): Target[];
  abstract hasData(target: Target): boolean;

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    if (this.hasData(target)) {
      return this.getTargets(target);
    }
    return this.processSurroundingPair(context, target).flatMap((target) =>
      this.getTargets(target)
    );
  }

  processSurroundingPair(
    context: ProcessedTargetsContext,
    target: Target
  ): Target[] {
    return processedSurroundingPairTarget(
      { type: "surroundingPair", delimiter: "any" },
      context,
      target
    );
  }
}

export class InteriorOnlyStage extends InteriorStage {
  constructor(private modifier: InteriorOnlyModifier) {
    super();
  }

  getTargets(target: Target): Target[] {
    if (target.interiorRange == null) {
      throw Error("No available interior");
    }
    const contentRange = target.interiorRange;
    return [
      new WeakTarget({
        editor: target.editor,
        isReversed: target.isReversed,
        contentRange,
      }),
    ];
  }

  hasData(target: Target): boolean {
    return target.interiorRange != null;
  }
}

export class ExcludeInteriorStage extends InteriorStage {
  constructor(private modifier: ExcludeInteriorModifier) {
    super();
  }

  getTargets(target: Target): Target[] {
    if (target.boundary == null) {
      throw Error("No available boundaries");
    }
    return target.boundary.map(
      (contentRange) =>
        new WeakTarget({
          editor: target.editor,
          isReversed: target.isReversed,
          contentRange,
        })
    );
  }

  hasData(target: Target): boolean {
    return target.boundary != null;
  }
}
