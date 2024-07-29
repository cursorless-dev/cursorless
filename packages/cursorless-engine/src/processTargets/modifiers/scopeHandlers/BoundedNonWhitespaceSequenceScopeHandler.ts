import {
  Direction,
  Position,
  ScopeType,
  TextEditor,
  type Range,
} from "@cursorless/common";
import { ParagraphTarget, TokenTarget } from "../../targets";
import { BaseScopeHandler } from "./BaseScopeHandler";
import type { TargetScope } from "./scope.types";
import type {
  ScopeHandler,
  ScopeIteratorRequirements,
} from "./scopeHandler.types";
import type { ScopeHandlerFactory } from "./ScopeHandlerFactory";

abstract class BoundedBaseScopeHandler extends BaseScopeHandler {
  protected readonly isHierarchical = true;
  private readonly targetScopeHandler: ScopeHandler;

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
    const interiorRange = this.getContainingSurroundingPairInterior(
      editor,
      position,
      direction,
      hints,
    );

    for (const scope of scopes) {
      if (interiorRange != null) {
        const intersection = scope.domain.intersection(interiorRange);
        if (intersection != null) {
          if (!intersection.isEmpty) {
            yield this.createTargetScope(editor, intersection);
          }
          continue;
        }
      }

      yield scope;
    }
  }

  private getContainingSurroundingPairInterior(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Range | undefined {
    const surroundingPairInteriorScopeHandler = this.scopeHandlerFactory.create(
      {
        type: "surroundingPairInterior",
        delimiter: "any",
      },
      this.languageId,
    )!;
    const pairInteriorScopes =
      surroundingPairInteriorScopeHandler.generateScopes(
        editor,
        position,
        direction,
        { ...hints, containment: "required" },
      );
    for (const interiorScope of pairInteriorScopes) {
      return interiorScope.domain;
    }
    return undefined;
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