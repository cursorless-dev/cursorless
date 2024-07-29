import {
  Direction,
  Position,
  ScopeType,
  TextEditor,
  type Range,
} from "@cursorless/common";
import { TokenTarget } from "../../targets";
import { BaseScopeHandler } from "./BaseScopeHandler";
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
  private readonly surroundingPairInteriorScopeHandler: ScopeHandler;

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

    this.surroundingPairInteriorScopeHandler = this.scopeHandlerFactory.create(
      {
        type: "surroundingPairInterior",
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
    );
    const pairInteriorScopes =
      this.surroundingPairInteriorScopeHandler.generateScopes(
        editor,
        position,
        direction,
        { ...hints, containment: "required" },
      );
    const interiorRange = next(pairInteriorScopes)?.domain;

    for (const scope of scopes) {
      if (interiorRange != null) {
        const intersection = scope.domain.intersection(interiorRange);
        if (intersection != null) {
          if (!intersection.isEmpty) {
            yield createTargetScope(editor, intersection);
          }
          continue;
        }
      }

      yield scope;
    }
  }
}

function next<T>(iter: Iterable<T>): T | undefined {
  for (const item of iter) {
    return item;
  }
  return undefined;
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
