import {
  Direction,
  Position,
  ScopeType,
  TextEditor,
  type Range,
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

export class BoundedNonWhitespaceSequenceScopeHandler extends BaseScopeHandler {
  public readonly scopeType = { type: "boundedNonWhitespaceSequence" } as const;
  protected readonly isHierarchical = true;
  private readonly nonWhitespaceSequenceScopeHandler: ScopeHandler;
  private readonly surroundingPairScopeHandler: ScopeHandler;

  constructor(
    private scopeHandlerFactory: ScopeHandlerFactory,
    _scopeType: ScopeType,
    private languageId: string,
  ) {
    super();

    this.nonWhitespaceSequenceScopeHandler = this.scopeHandlerFactory.create(
      { type: "nonWhitespaceSequence" },
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
    return {
      type: "oneOf",
      scopeTypes: [
        { type: "line" },
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
    const scopes = this.nonWhitespaceSequenceScopeHandler.generateScopes(
      editor,
      position,
      direction,
      hints,
      //   {
      //     ...hints,
      //     allowAdjacentScopes: true,
      //     containment: undefined,
      //   },
    );

    for (const scope of scopes) {
      const pairScopes = this.surroundingPairScopeHandler.generateScopes(
        scope.editor,
        // scope.domain.start,
        // "forward",
        position,
        direction,
        hints,
        // {
        // ...hints,

        //   distalPosition: scope.domain.end,
        // },
      );

      const allScopes = [scope];

      for (const pairScope of pairScopes) {
        const interiorRange = pairScope.getTargets(false)[0].getInterior()![0]
          .contentRange;
        const intersection = scope.domain.intersection(interiorRange);
        if (intersection != null && !intersection.isEmpty) {
          allScopes.push(createTargetScope(editor, intersection));
        }
      }

      allScopes.sort((a, b) => compareTargetScopes(direction, position, a, b));

      yield* allScopes;
    }
  }
}

function createTargetScope(
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
