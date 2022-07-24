import { Target } from "../../typings/target.types";
import {
  LeadingModifier,
  TrailingModifier,
} from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";
import { implicitScopeTypeContainingTokenStage } from "./commonImplicitScopeTypeContainingScopeStages";

export class LeadingStage implements ModifierStage {
  constructor(private modifier: LeadingModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    return implicitScopeTypeContainingTokenStage
      .run(context, target)
      .map((target) => {
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
    return implicitScopeTypeContainingTokenStage
      .run(context, target)
      .map((target) => {
        const trailing = target.getTrailingDelimiterTarget();
        if (trailing == null) {
          throw Error("No available trailing delimiter range");
        }
        return trailing;
      });
  }
}
