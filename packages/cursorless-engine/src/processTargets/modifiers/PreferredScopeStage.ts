import { type Position, type PreferredScopeModifier } from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import { getContainingScopeTarget } from "./getContainingScopeTarget";
import type { TargetScope } from "./scopeHandlers/scope.types";
import type { ScopeHandler } from "./scopeHandlers/scopeHandler.types";
import { ScopeHandlerFactory } from "./scopeHandlers/ScopeHandlerFactory";

export class PreferredScopeStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private scopeHandlerFactory: ScopeHandlerFactory,
    private modifier: PreferredScopeModifier,
  ) {}

  run(target: Target): Target[] {
    const { scopeType } = this.modifier;

    const scopeHandler = this.scopeHandlerFactory.create(
      this.modifier.scopeType,
      target.editor.document.languageId,
    );

    if (scopeHandler == null) {
      throw Error(`Couldn't create scope handler for: ${scopeType.type}`);
    }

    const containingTargets = getContainingScopeTarget(target, scopeHandler);

    if (containingTargets != null) {
      return containingTargets;
    }

    const closestTargets = this.tryGetClosestScopeTargets(target, scopeHandler);

    if (closestTargets != null) {
      return closestTargets;
    }

    throw Error(`No scopes found for scope type: ${scopeType.type}`);
  }

  private tryGetClosestScopeTargets(
    target: Target,
    scopeHandler: ScopeHandler,
  ): Target[] | undefined {
    const { start, end } = target.contentRange;

    const previousScopes = scopeHandler.generateScopes(
      target.editor,
      start,
      "backward",
    );
    const nextScopes = scopeHandler.generateScopes(
      target.editor,
      end,
      "forward",
    );
    const scopes: TargetScope[] = [
      next(previousScopes),
      next(nextScopes),
    ].filter((scope) => scope != null);

    if (scopes.length === 0) {
      return undefined;
    }

    const candidates = scopes.map((scope) => {
      const distance = Math.min(
        distanceBetweenPositions(end, scope.domain.start),
        distanceBetweenPositions(start, scope.domain.end),
      );
      return { scope, distance };
    });

    candidates.sort((a, b) => {
      // First sort by distance to position
      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }
      // Then sort by document order
      return a.scope.domain.start.compareTo(b.scope.domain.start);
    });

    return candidates[0].scope.getTargets(target.isReversed);
  }
}

function next(scopes: Iterable<TargetScope>): TargetScope | undefined {
  for (const scope of scopes) {
    return scope;
  }
  return undefined;
}

function distanceBetweenPositions(a: Position, b: Position): number {
  return (
    Math.abs(a.line - b.line) * 10000 + Math.abs(a.character - b.character)
  );
}
