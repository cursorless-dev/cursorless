import { Target } from "../../typings/target.types";
import {
  LeadingModifier,
  TrailingModifier,
} from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import getModifierStage from "../getModifierStage";
import { ModifierStage } from "../PipelineStages.types";

export class LeadingStage implements ModifierStage {
  constructor(private modifier: LeadingModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const leading = getTargetToUse(context, target).getLeadingDelimiterTarget();
    if (leading == null) {
      throw Error("No available leading delimiter range");
    }
    return [leading];
  }
}

export class TrailingStage implements ModifierStage {
  constructor(private modifier: TrailingModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const trailing = getTargetToUse(
      context,
      target
    ).getTrailingDelimiterTarget();
    if (trailing == null) {
      throw Error("No available trailing delimiter range");
    }
    return [trailing];
  }
}

/**If the content range of the given target is empty convert it to a token target. If not just return it unmodified. */
function getTargetToUse(context: ProcessedTargetsContext, target: Target) {
  if (target.contentRange.isEmpty) {
    const tokenStage = getModifierStage({
      type: "containingScope",
      scopeType: { type: "token" },
    });
    return tokenStage.run(context, target)[0];
  }
  return target;
}
