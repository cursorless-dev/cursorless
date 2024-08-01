import { type Position, type PreferredScopeModifier } from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import { getContainingScopeTarget } from "./getContainingScopeTarget";
import { ScopeHandlerFactory } from "./scopeHandlers/ScopeHandlerFactory";
import { getEveryScopeTargets } from "./targetSequenceUtils";

export class PreferredScopeStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private scopeHandlerFactory: ScopeHandlerFactory,
    private modifier: PreferredScopeModifier,
  ) {}

  run(target: Target): Target[] {
    const { scopeType } = this.modifier;

    const containingTargets = this.tryGetContainingScopeTargets(target);

    if (containingTargets != null) {
      return containingTargets;
    }

    const closestTargets = this.tryGetClosestScopeTargets(target);

    if (closestTargets != null) {
      return closestTargets;
    }

    throw Error(`No scopes found for scope type: ${scopeType.type}`);
  }

  private tryGetContainingScopeTargets(target: Target): Target[] | undefined {
    const scopeHandler = this.scopeHandlerFactory.create(
      this.modifier.scopeType,
      target.editor.document.languageId,
    );

    if (scopeHandler == null) {
      return undefined;
    }

    return getContainingScopeTarget(target, scopeHandler);
  }

  private tryGetClosestScopeTargets(target: Target): Target[] | undefined {
    const targets = getEveryScopeTargets(
      this.modifierStageFactory,
      target,
      this.modifier.scopeType,
    );

    const { active } = target.contentSelection;

    const candidates = targets.map((target) => {
      const distance = Math.min(
        distanceBetweenPositions(active, target.contentRange.start),
        distanceBetweenPositions(active, target.contentRange.end),
      );
      return { target, distance };
    });

    if (candidates.length === 0) {
      return undefined;
    }

    candidates.sort((a, b) => {
      // First sort by distance to position
      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }
      // Then sort by document order
      return a.target.contentRange.start.compareTo(b.target.contentRange.start);
    });

    return [candidates[0].target];
  }
}

function distanceBetweenPositions(a: Position, b: Position): number {
  return (
    Math.abs(a.line - b.line) * 10000 + Math.abs(a.character - b.character)
  );
}
