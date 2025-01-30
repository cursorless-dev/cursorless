import {
  NoContainingScopeError,
  type HeadModifier,
  type ScopeType,
  type TailModifier,
} from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import type { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import {
  getModifierStagesFromTargetModifiers,
  processModifierStages,
} from "../TargetPipelineRunner";
import { HeadTailTarget, PlainTarget } from "../targets";

export class HeadTailStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private modifier: HeadModifier | TailModifier,
  ) {}

  run(target: Target): Target[] {
    const modifierStages = this.getModifierStages();
    const modifiedTargets = processModifierStages(modifierStages, [target]);
    const isHead = this.modifier.type === "extendThroughStartOf";

    return modifiedTargets.map((modifiedTarget) => {
      return new HeadTailTarget({
        editor: target.editor,
        isReversed: isHead,
        inputTarget: target,
        modifiedTarget,
        isHead,
      });
    });
  }

  private getModifierStages(): ModifierStage[] {
    if (this.modifier.modifiers != null) {
      return getModifierStagesFromTargetModifiers(
        this.modifierStageFactory,
        this.modifier.modifiers,
      );
    }

    return [new BoundedLineStage(this.modifierStageFactory, this.modifier)];
  }
}

class BoundedLineStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private modifier: HeadModifier | TailModifier,
  ) {}

  run(target: Target): Target[] {
    const line = this.getContainingLine(target);
    const pairInterior = this.getContainingPairInterior(target);

    if (pairInterior == null) {
      return [line];
    }

    const intersection = line.contentRange.intersection(
      pairInterior.contentRange,
    );

    if (intersection == null || intersection.isEmpty) {
      return [line];
    }

    return [
      new PlainTarget({
        editor: target.editor,
        isReversed: target.isReversed,
        contentRange: intersection,
      }),
    ];
  }

  private getContainingPairInterior(target: Target): Target | undefined {
    try {
      return this.getContaining(target, {
        type: "surroundingPairInterior",
        delimiter: "any",
      })[0];
    } catch (error) {
      if (error instanceof NoContainingScopeError) {
        return undefined;
      }
      throw error;
    }
  }

  private getContainingLine(target: Target): Target {
    return this.getContaining(target, {
      type: "line",
    })[0];
  }

  private getContaining(target: Target, scopeType: ScopeType): Target[] {
    return this.modifierStageFactory
      .create({ type: "containingScope", scopeType })
      .run(target);
  }
}
