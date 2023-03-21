import { Target } from "../../typings/target.types";
import { LeadingModifier, TrailingModifier } from "@cursorless/common";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";
import { containingTokenIfUntypedStage } from "./commonContainingScopeIfUntypedStages";

/**
 * Throw this error if user has requested leading or trailing delimiter but no
 * such delimiter exists on the given target.
 */
class NoDelimiterError extends Error {
  constructor(type: "leading" | "trailing") {
    super(`Target has no ${type} delimiter.`);
    this.name = "NoDelimiterError";
  }
}

export class LeadingStage implements ModifierStage {
  constructor(private modifier: LeadingModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    return containingTokenIfUntypedStage.run(context, target).map((target) => {
      const leading = target.getLeadingDelimiterTarget();
      if (leading == null) {
        throw new NoDelimiterError("leading");
      }
      return leading;
    });
  }
}

export class TrailingStage implements ModifierStage {
  constructor(private modifier: TrailingModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    return containingTokenIfUntypedStage.run(context, target).map((target) => {
      const trailing = target.getTrailingDelimiterTarget();
      if (trailing == null) {
        throw new NoDelimiterError("trailing");
      }
      return trailing;
    });
  }
}
