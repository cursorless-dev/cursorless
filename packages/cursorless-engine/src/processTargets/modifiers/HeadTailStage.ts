import {
  NoContainingScopeError,
  type HeadModifier,
  type Modifier,
  type ScopeType,
  type TailModifier,
} from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import type { ModifierStageFactory } from "../ModifierStageFactory";
import type {
  ModifierStage,
  ModifierStateOptions,
} from "../PipelineStages.types";
import {
  getModifierStagesFromTargetModifiers,
  processModifierStages,
} from "../TargetPipelineRunner";
import { HeadTailTarget, PlainTarget } from "../targets";

class HeadTailStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private modifiers: Modifier[] | undefined,
    private isHead: boolean,
  ) {}

  run(target: Target): Target[] {
    const modifierStages = this.getModifierStages();
    const modifiedTargets = processModifierStages(modifierStages, [target]);

    return modifiedTargets.map((modifiedTarget) => {
      return new HeadTailTarget({
        editor: target.editor,
        isReversed: this.isHead,
        inputTarget: target,
        modifiedTarget,
        isHead: this.isHead,
      });
    });
  }

  private getModifierStages(): ModifierStage[] {
    if (this.modifiers != null) {
      return getModifierStagesFromTargetModifiers(
        this.modifierStageFactory,
        this.modifiers,
      );
    }

    return [new BoundedLineStage(this.modifierStageFactory)];
  }
}

export class HeadStage extends HeadTailStage {
  constructor(
    modifierStageFactory: ModifierStageFactory,
    modifier: HeadModifier,
  ) {
    super(modifierStageFactory, modifier.modifiers, true);
  }
}

export class TailStage extends HeadTailStage {
  constructor(
    modifierStageFactory: ModifierStageFactory,
    modifier: TailModifier,
  ) {
    super(modifierStageFactory, modifier.modifiers, false);
  }
}

class BoundedLineStage implements ModifierStage {
  constructor(private modifierStageFactory: ModifierStageFactory) {}

  run(target: Target, options: ModifierStateOptions): Target[] {
    const line = this.getContainingLine(target, options);
    const interior = this.getContainingInterior(target, options);

    const intersection =
      interior != null
        ? line.contentRange.intersection(interior.contentRange)
        : null;

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

  private getContainingInterior(
    target: Target,
    options: ModifierStateOptions,
  ): Target | undefined {
    try {
      return this.getContaining(target, options, {
        type: "interior",
      });
    } catch (error) {
      if (error instanceof NoContainingScopeError) {
        return undefined;
      }
      throw error;
    }
  }

  private getContainingLine(
    target: Target,
    options: ModifierStateOptions,
  ): Target {
    return this.getContaining(target, options, {
      type: "line",
    });
  }

  private getContaining(
    target: Target,
    options: ModifierStateOptions,
    scopeType: ScopeType,
  ): Target {
    return this.modifierStageFactory
      .create({ type: "containingScope", scopeType })
      .run(target, options)[0];
  }
}
