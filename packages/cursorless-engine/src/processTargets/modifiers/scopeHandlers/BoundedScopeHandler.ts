import { Direction, Position, ScopeType, TextEditor } from "@cursorless/common";
import {
  BoundedParagraphTarget,
  InteriorTarget,
  ParagraphTarget,
  TokenTarget,
} from "../../targets";
import { BaseScopeHandler } from "./BaseScopeHandler";
import { compareTargetScopes } from "./compareTargetScopes";
import type { TargetScope } from "./scope.types";
import type {
  ScopeHandler,
  ScopeIteratorRequirements,
} from "./scopeHandler.types";
import type { ScopeHandlerFactory } from "./ScopeHandlerFactory";
import { Target } from "../../../typings/target.types";

abstract class BoundedBaseScopeHandler extends BaseScopeHandler {
  protected readonly isHierarchical = true;
  private readonly targetScopeHandler: ScopeHandler;
  private readonly surroundingPairInteriorScopeHandler: ScopeHandler;

  constructor(
    private scopeHandlerFactory: ScopeHandlerFactory,
    private languageId: string,
    private targetScopeType: ScopeType,
  ) {
    super();

    this.targetScopeHandler = this.scopeHandlerFactory.create(
      this.targetScopeType,
      this.languageId,
    )!;
    this.surroundingPairInteriorScopeHandler = this.scopeHandlerFactory.create(
      {
        type: "surroundingPairInterior",
        delimiter: "any",
      },
      this.languageId,
    )!;
  }

  get iterationScopeType(): ScopeType {
    if (this.targetScopeHandler.iterationScopeType.type === "custom") {
      throw Error(
        "Iteration scope type can't be custom for BoundedBaseScopeHandler",
      );
    }
    return {
      type: "oneOf",
      scopeTypes: [
        this.targetScopeHandler.iterationScopeType,
        {
          type: "surroundingPairInterior",
          delimiter: "any",
        },
      ],
    };
  }

  *generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    const targetScopes = this.targetScopeHandler.generateScopes(
      editor,
      position,
      direction,
      {
        ...hints,
        // Don't skip containing paint since it might have non contained nested scopes.
        containment:
          hints.containment !== "disallowed" ? hints.containment : undefined,
      },
    );

    const interiorScopes = Array.from(
      this.surroundingPairInteriorScopeHandler.generateScopes(
        editor,
        position,
        direction,
        {
          ...hints,
          // For every (skipAncestorScopes=true) we don't want to go outside of the surrounding pair
          containment:
            hints.containment == null && hints.skipAncestorScopes
              ? "required"
              : hints.containment,
        },
      ),
    );

    for (const targetScope of targetScopes) {
      const allScopes: TargetScope[] = [];

      for (const interiorScope of interiorScopes) {
        const domain = targetScope.domain.intersection(interiorScope.domain);
        if (domain != null && !domain.isEmpty) {
          allScopes.push({
            editor,
            domain,
            getTargets: (isReversed) => {
              return [
                this.getTargets(
                  ensureSingleTarget(targetScope, isReversed),
                  ensureSingleTarget(interiorScope, isReversed),
                ),
              ];
            },
          });
        }
      }

      // NB: We add the target scope last so that if it is identical to
      // one of our intersection scopes, we prefer that one so that rich ranges
      // function properly
      allScopes.push(targetScope);

      allScopes.sort((a, b) => compareTargetScopes(direction, position, a, b));

      yield* allScopes;
    }
  }

  protected abstract getTargets(target: Target, interior: Target): Target;
}

function ensureSingleTarget(scope: TargetScope, isReversed: boolean): Target {
  const targets = scope.getTargets(isReversed);

  if (targets.length !== 1) {
    throw Error(`Expected one target but got ${targets.length}`);
  }

  return targets[0];
}

export class BoundedNonWhitespaceSequenceScopeHandler extends BoundedBaseScopeHandler {
  public readonly scopeType = { type: "boundedNonWhitespaceSequence" } as const;

  constructor(
    scopeHandlerFactory: ScopeHandlerFactory,
    _scopeType: ScopeType,
    languageId: string,
  ) {
    super(scopeHandlerFactory, languageId, { type: "nonWhitespaceSequence" });
  }

  protected getTargets(target: Target, interior: Target): Target {
    const contentRange = target.contentRange.intersection(
      interior.contentRange,
    );

    if (contentRange == null || contentRange.isEmpty) {
      throw Error("Expected non empty intersection");
    }

    return new TokenTarget({
      editor: target.editor,
      isReversed: target.isReversed,
      contentRange,
    });
  }
}

export class BoundedParagraphScopeHandler extends BoundedBaseScopeHandler {
  public readonly scopeType = { type: "boundedParagraph" } as const;

  constructor(
    scopeHandlerFactory: ScopeHandlerFactory,
    scopeType: ScopeType,
    languageId: string,
  ) {
    super(scopeHandlerFactory, languageId, { type: "paragraph" });
  }

  protected getTargets(target: Target, interior: InteriorTarget): Target {
    if (!(target instanceof ParagraphTarget)) {
      throw Error("Expected ParagraphTarget");
    }

    return new BoundedParagraphTarget({
      editor: target.editor,
      isReversed: target.isReversed,
      paragraphTarget: target,
      containingInterior: interior,
    });
  }
}
