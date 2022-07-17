import type { Target } from "../../typings/target.types";
import type {
  LeadingModifier,
  TrailingModifier,
} from "../../typings/targetDescriptor.types";
import type { ProcessedTargetsContext } from "../../typings/Types";
import type { ModifierStage } from "../PipelineStages.types";
import { weakContainingTokenStage } from "./commonWeakContainingScopeStages";

export class LeadingStage implements ModifierStage {
  constructor(private modifier: LeadingModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    return weakContainingTokenStage.run(context, target).map((target) => {
      const leading = target.getLeadingDelimiterTarget();
      if (leading == null) {
        throw Error("No available leading delimiter range");
      }
      return leading;
    });
  }
}

export class TrailingStage implements ModifierStage {
  constructor(private modifier: TrailingModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    return weakContainingTokenStage.run(context, target).map((target) => {
      const trailing = target.getTrailingDelimiterTarget();
      if (trailing == null) {
        throw Error("No available trailing delimiter range");
      }
      return trailing;
    });
  }
}
