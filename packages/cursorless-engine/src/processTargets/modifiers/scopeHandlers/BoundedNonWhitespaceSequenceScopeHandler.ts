import {
  Direction,
  Position,
  ScopeType,
  TextEditor,
  type Range,
} from "@cursorless/common";
import { ParagraphTarget, TokenTarget } from "../../targets";
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
  private readonly surroundingPairScopeHandler: ScopeHandler;

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
    this.surroundingPairScopeHandler = this.scopeHandlerFactory.create(
      {
        type: "surroundingPair",
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
    const scopes = this.targetScopeHandler.generateScopes(
      editor,
      position,
      direction,
      hints,
    );

    for (const scope of scopes) {
      const pairScopes = this.surroundingPairScopeHandler.generateScopes(
        scope.editor,
        scope.domain.start,
        "forward",
        {
          ...hints,
          distalPosition: scope.domain.end,
        },
      );

      const allScopes = [scope];

      for (const pairScope of pairScopes) {
        const interiorRange = pairScope.getTargets(false)[0].getInterior()![0]
          .contentRange;
        const intersection = scope.domain.intersection(interiorRange);
        if (intersection != null && !intersection.isEmpty) {
          allScopes.push(this.createTargetScope(editor, intersection));
        }
      }

      allScopes.sort((a, b) => compareTargetScopes(direction, position, a, b));

      yield* allScopes;
    }
  }

  protected abstract createTargetScope(
    editor: TextEditor,
    contentRange: Range,
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

export class BoundedParagraphScopeHandler extends BoundedBaseScopeHandler {
  public readonly scopeType = { type: "boundedParagraph" } as const;

  constructor(
    scopeHandlerFactory: ScopeHandlerFactory,
    scopeType: ScopeType,
    languageId: string,
  ) {
    super(scopeHandlerFactory, languageId, { type: "paragraph" });
  }

  protected createTargetScope(
    editor: TextEditor,
    contentRange: Range,
  ): TargetScope {
    return {
      editor,
      domain: contentRange,
      getTargets(isReversed) {
        return [
          new ParagraphTarget({
            editor,
            isReversed,
            contentRange,
          }),
        ];
      },
    };
  }
}
