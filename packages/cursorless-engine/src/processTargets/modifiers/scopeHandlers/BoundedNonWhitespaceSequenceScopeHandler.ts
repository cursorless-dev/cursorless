import {
  Direction,
  Position,
  ScopeType,
  TextEditor,
  Range,
} from "@cursorless/common";
import { TokenTarget } from "../../targets";
import { BaseScopeHandler } from "./BaseScopeHandler";
import { compareTargetScopes } from "./compareTargetScopes";
import type { TargetScope } from "./scope.types";
import type {
  ScopeHandler,
  ScopeIteratorRequirements,
} from "./scopeHandler.types";
import type { ScopeHandlerFactory } from "./ScopeHandlerFactory";

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

    const pairScopes = Array.from(
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
      const allScopes = [targetScope];

      for (const pairScope of pairScopes) {
        const interiorRange = pairScope.domain;
        const intersection = targetScope.domain.intersection(interiorRange);
        if (intersection != null && !intersection.isEmpty) {
          allScopes.push(
            this.createTargetScope(editor, intersection, interiorRange),
          );
        }
      }

      allScopes.sort((a, b) => compareTargetScopes(direction, position, a, b));

      yield* allScopes;
    }
  }

  protected abstract createTargetScope(
    editor: TextEditor,
    contentRange: Range,
    interiorRange: Range,
  ): TargetScope;
}

export class BoundedNonWhitespaceSequenceScopeHandler extends BoundedBaseScopeHandler {
  public readonly scopeType = { type: "boundedNonWhitespaceSequence" } as const;

  constructor(
    scopeHandlerFactory: ScopeHandlerFactory,
    scopeType: ScopeType,
    languageId: string,
  ) {
    super(scopeHandlerFactory, languageId, { type: "nonWhitespaceSequence" });
  }

  protected createTargetScope(
    editor: TextEditor,
    contentRange: Range,
    _interiorRange: Range,
  ): TargetScope {
    return {
      editor,
      domain: contentRange,
      getTargets(isReversed) {
        return [
          new TokenTarget({
            editor,
            isReversed,
            contentRange,
          }),
        ];
      },
    };
  }
}
