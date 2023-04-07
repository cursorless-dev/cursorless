import { HeadTailModifier, Modifier, Range } from "@cursorless/common";
import { ProcessedTargetsContext } from "../../typings/Types";
import { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import { ModifierStage } from "../PipelineStages.types";
import {
  getModifierStagesFromTargetModifiers,
  processModifierStages,
} from "../TargetPipeline";
import { TokenTarget } from "../targets";

abstract class HeadTailStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private isReversed: boolean,
    private modifiers?: Modifier[],
  ) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const modifiers = this.modifiers ?? [
      {
        type: "containingScope",
        scopeType: { type: "line" },
      },
    ];

    const modifierStages = getModifierStagesFromTargetModifiers(
      this.modifierStageFactory,
      modifiers,
    );
    const modifiedTargets = processModifierStages(context, modifierStages, [
      target,
    ]);

    return modifiedTargets.map((modifiedTarget) => {
      const contentRange = this.constructContentRange(
        target.contentRange,
        modifiedTarget.contentRange,
      );

      return new TokenTarget({
        editor: target.editor,
        isReversed: this.isReversed,
        contentRange,
      });
    });
  }

  protected abstract constructContentRange(
    originalRange: Range,
    modifiedRange: Range,
  ): Range;
}

export class HeadStage extends HeadTailStage {
  constructor(
    modifierStageFactory: ModifierStageFactory,
    modifier: HeadTailModifier,
  ) {
    super(modifierStageFactory, true, modifier.modifiers);
  }

  protected constructContentRange(originalRange: Range, modifiedRange: Range) {
    return new Range(modifiedRange.start, originalRange.end);
  }
}

export class TailStage extends HeadTailStage {
  constructor(
    modifierStageFactory: ModifierStageFactory,
    modifier: HeadTailModifier,
  ) {
    super(modifierStageFactory, false, modifier.modifiers);
  }

  protected constructContentRange(originalRange: Range, modifiedRange: Range) {
    return new Range(originalRange.start, modifiedRange.end);
  }
}
