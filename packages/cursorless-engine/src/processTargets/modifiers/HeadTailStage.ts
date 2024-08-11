import type { HeadModifier, Modifier, TailModifier } from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import type { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import {
  getModifierStagesFromTargetModifiers,
  processModifierStages,
} from "../TargetPipelineRunner";
import { HeadTailTarget } from "../targets";

export class HeadTailStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private modifier: HeadModifier | TailModifier,
  ) {}

  run(target: Target): Target[] {
    const modifiers: Modifier[] = this.modifier.modifiers ?? [
      {
        type: "containingScope",
        scopeType: {
          type: "oneOf",
          scopeTypes: [
            {
              type: "line",
            },
            {
              type: "surroundingPairInterior",
              delimiter: "any",
            },
          ],
        },
      },
    ];

    const modifierStages = getModifierStagesFromTargetModifiers(
      this.modifierStageFactory,
      modifiers,
    );
    const modifiedTargets = processModifierStages(modifierStages, [target]);

    return modifiedTargets.map((modifiedTarget) => {
      const isHead = this.modifier.type === "extendThroughStartOf";

      return new HeadTailTarget({
        editor: target.editor,
        isReversed: isHead,
        inputTarget: target,
        modifiedTarget,
        isHead,
      });
    });
  }
}
