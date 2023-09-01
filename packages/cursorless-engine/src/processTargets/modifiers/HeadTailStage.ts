import type { HeadModifier, Modifier, TailModifier } from "@cursorless/common";
import { Range } from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import type { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import {
  getModifierStagesFromTargetModifiers,
  processModifierStages,
} from "../TargetPipelineRunner";
import { TokenTarget } from "../targets";

abstract class HeadTailStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private isReversed: boolean,
    private modifiers?: Modifier[],
  ) {}

  run(target: Target): Target[] {
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
    const modifiedTargets = processModifierStages(modifierStages, [target]);

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
    modifier: HeadModifier,
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
    modifier: TailModifier,
  ) {
    super(modifierStageFactory, false, modifier.modifiers);
  }

  protected constructContentRange(originalRange: Range, modifiedRange: Range) {
    return new Range(originalRange.start, modifiedRange.end);
  }
}
