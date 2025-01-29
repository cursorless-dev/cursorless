import {
  NoContainingScopeError,
  type ExcludeInteriorModifier,
  type InteriorOnlyModifier,
  type ScopeType,
} from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import type { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import { ModifyIfConditionStage } from "./ConditionalModifierStages";
import type { ScopeHandlerFactory } from "./scopeHandlers";

export class InteriorOnlyStage implements ModifierStage {
  constructor(
    private scopeHandlerFactory: ScopeHandlerFactory,
    private modifier: InteriorOnlyModifier,
  ) {}

  run(target: Target): Target[] {
    const interior = target.getInterior();

    if (interior != null) {
      return interior;
    }

    const { editor, isReversed, contentRange } = target;
    const scopeType: ScopeType = { type: "interior" };

    const scopeHandler = this.scopeHandlerFactory.create(
      { type: target.hasExplicitScopeType ? "interiorParseTree" : "interior" },
      editor.document.languageId,
    );

    const scopes = scopeHandler.generateScopes(
      editor,
      contentRange.start,
      "forward",
      {
        containment: "required",
        allowAdjacentScopes: true,
        skipAncestorScopes: true,
        distalPosition: contentRange.end,
      },
    );

    const targets = Array.from(scopes).flatMap((scope) =>
      scope.getTargets(isReversed),
    );

    if (targets.length === 0) {
      throw new NoContainingScopeError(scopeType.type);
    }

    return targets;
  }
}

export class ExcludeInteriorStage implements ModifierStage {
  private containingSurroundingPairIfNoBoundaryStage: ModifierStage;

  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private modifier: ExcludeInteriorModifier,
  ) {
    this.containingSurroundingPairIfNoBoundaryStage =
      getContainingSurroundingPairIfNoBoundaryStage(this.modifierStageFactory);
  }

  run(target: Target): Target[] {
    return this.containingSurroundingPairIfNoBoundaryStage
      .run(target)
      .flatMap((target) => target.getBoundary()!);
  }
}

export function getContainingSurroundingPairIfNoBoundaryStage(
  modifierStageFactory: ModifierStageFactory,
): ModifierStage {
  return new ModifyIfConditionStage(
    modifierStageFactory,
    {
      type: "containingScope",
      scopeType: { type: "surroundingPair", delimiter: "any" },
    },
    (target) => target.getBoundary() == null,
  );
}
